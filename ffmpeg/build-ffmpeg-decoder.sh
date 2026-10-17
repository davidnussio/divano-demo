#!/usr/bin/env bash
#
# Builds Media3's FFmpeg audio decoder (androidx/media, libraries/decoder_ffmpeg) from source and
# publishes it to third_party/maven as ch.dambox.divano.media3:decoder-ffmpeg:<media3 version>.
#
# Google doesn't publish this module and the prebuilt ones (Jellyfin, NextLib) are GPL-3.0. Built
# here FFmpeg stays LGPL-2.1-or-later (no --enable-gpl, no --enable-nonfree) and only gets the
# audio decoders a device may lack: Dolby (AC-3, E-AC-3, TrueHD/MLP), DTS and MPEG audio (MP2,
# common in DVB channels). See third_party/README.md for what the licence asks of us.
#
# Run it again after bumping media3 in gradle/libs.versions.toml: until then the app doesn't
# build, because the decoder must match Media3's version exactly.
#
# Needs: the NDK below (sdkmanager "ndk;26.1.10909125"), the SDK's CMake, and a JDK that Media3's
# Gradle runs on (JAVA_HOME; defaults to Android Studio's).
#
# Usage: scripts/build-ffmpeg-decoder.sh
set -euo pipefail

cd "$(dirname "$0")/.."
ROOT=$(pwd)

FFMPEG_VERSION=6.0.1  # Media3 recommends the 6.0 branch
FFMPEG_SHA256=9b16b8731d78e596b4be0d720428ca42df642bb2d78342881ff7f5bc29fc9623
NDK_VERSION=26.1.10909125  # the NDK Media3 tests the build with (r26b)
DECODERS=(ac3 eac3 truehd mlp dca mp3)
# Where the exact source and this script are hosted next to our binaries, as FFmpeg's LGPL
# checklist asks (the divano-demo repository): after a change of version, publish them there too.
SOURCE_PAGE=https://davidnussio.github.io/divano-demo/ffmpeg/

MEDIA3_VERSION=$(sed -n 's/^media3 = "\(.*\)"/\1/p' gradle/libs.versions.toml)
MIN_SDK=$(sed -n 's/^minSdk = "\(.*\)"/\1/p' gradle/libs.versions.toml)
SDK_DIR=${ANDROID_HOME:-$(sed -n 's/^sdk.dir=//p' local.properties 2>/dev/null)}
NDK_PATH="$SDK_DIR/ndk/$NDK_VERSION"
case "$(uname -s)" in
  Darwin) HOST_PLATFORM=darwin-x86_64 ;;  # the NDK's macOS binaries are universal
  *) HOST_PLATFORM=linux-x86_64 ;;
esac
STUDIO_JDK="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
if [[ -z "${JAVA_HOME:-}" && -d "$STUDIO_JDK" ]]; then export JAVA_HOME="$STUDIO_JDK"; fi

[[ -d "$NDK_PATH" ]] || { echo "NDK $NDK_VERSION not found in $SDK_DIR/ndk: sdkmanager \"ndk;$NDK_VERSION\"" >&2; exit 1; }

WORK="$ROOT/build/ffmpeg-decoder"
MEDIA3="$WORK/media3-$MEDIA3_VERSION"
MODULE="$MEDIA3/libraries/decoder_ffmpeg"
mkdir -p "$WORK"

echo "== Media3 $MEDIA3_VERSION, FFmpeg $FFMPEG_VERSION, decoders: ${DECODERS[*]}"

rm -rf "$MEDIA3"
git clone --quiet --depth 1 --branch "$MEDIA3_VERSION" https://github.com/androidx/media.git "$MEDIA3"

TARBALL="$WORK/ffmpeg-$FFMPEG_VERSION.tar.xz"
[[ -f "$TARBALL" ]] || curl -fsSL -o "$TARBALL" "https://ffmpeg.org/releases/ffmpeg-$FFMPEG_VERSION.tar.xz"
echo "$FFMPEG_SHA256  $TARBALL" | shasum -a 256 -c -
mkdir -p "$MODULE/src/main/jni/ffmpeg"
tar -xJf "$TARBALL" --strip-components 1 -C "$MODULE/src/main/jni/ffmpeg"

(cd "$MODULE/src/main/jni" && ./build_ffmpeg.sh "$MODULE/src/main" "$NDK_PATH" "$HOST_PLATFORM" "$MIN_SDK" "${DECODERS[@]}")

# The configuration of the last ABI built is still there: same options for all of them.
CONFIG="$MODULE/src/main/jni/ffmpeg/config.h"
grep -q '^#define CONFIG_GPL 0$' "$CONFIG" && grep -q '^#define CONFIG_NONFREE 0$' "$CONFIG" \
  || { echo "FFmpeg was configured as GPL or non-free" >&2; exit 1; }

# FFmpeg's libraries are built; the JNI wrapper includes FFmpeg's directory, where on a
# case-insensitive file system (macOS) the tarball's VERSION file shadows C++'s <version>.
mv "$MODULE/src/main/jni/ffmpeg/VERSION" "$MODULE/src/main/jni/ffmpeg/VERSION.txt"

# The JNI wrapper is built with the same NDK as FFmpeg, not whichever one AGP defaults to.
echo "android.ndkVersion = \"$NDK_VERSION\"" >> "$MODULE/build.gradle.kts"
# Google Play requires 16 KB pages on 64-bit devices; NDK r26b still links for 4 KB.
echo 'target_link_options(ffmpegJNI PRIVATE "-Wl,-z,max-page-size=16384")' >> "$MODULE/src/main/jni/CMakeLists.txt"
echo "sdk.dir=$SDK_DIR" > "$MEDIA3/local.properties"
(cd "$MEDIA3" && ./gradlew --quiet --no-daemon :lib-decoder-ffmpeg:assembleRelease)

OUT="$ROOT/third_party/maven/ch/dambox/divano/media3/decoder-ffmpeg/$MEDIA3_VERSION"
AAR="$OUT/decoder-ffmpeg-$MEDIA3_VERSION.aar"
mkdir -p "$OUT"
cp "$MODULE/buildout/outputs/aar/lib-decoder-ffmpeg-release.aar" "$AAR"

# Stripped here, so the app's size doesn't depend on which NDK its build finds for stripping.
STRIP="$NDK_PATH/toolchains/llvm/prebuilt/$HOST_PLATFORM/bin/llvm-strip"
UNPACKED="$WORK/aar"
rm -rf "$UNPACKED" && mkdir -p "$UNPACKED"
(cd "$UNPACKED" && unzip -q "$AAR" && "$STRIP" --strip-unneeded jni/*/libffmpegJNI.so && rm "$AAR" && zip -q -X -r "$AAR" .)

cat > "$OUT/decoder-ffmpeg-$MEDIA3_VERSION.pom" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0">
  <modelVersion>4.0.0</modelVersion>
  <groupId>ch.dambox.divano.media3</groupId>
  <artifactId>decoder-ffmpeg</artifactId>
  <version>$MEDIA3_VERSION</version>
  <packaging>aar</packaging>
  <name>FFmpeg $FFMPEG_VERSION · Media3 decoder</name>
  <url>https://ffmpeg.org</url>
  <description>FFmpeg $FFMPEG_VERSION audio decoders (${DECODERS[*]}) in the FFmpeg extension of Media3 $MEDIA3_VERSION. FFmpeg is licensed under the GNU LGPL version 2.1 or later. Its source code, unmodified, and how it was built: ${SOURCE_PAGE} (source: ${SOURCE_PAGE}ffmpeg-$FFMPEG_VERSION.tar.xz).</description>
  <licenses>
    <license><name>Apache License 2.0</name><url>https://www.apache.org/licenses/LICENSE-2.0</url></license>
    <license><name>GNU Lesser General Public License v2.1 or later</name><url>https://www.gnu.org/licenses/old-licenses/lgpl-2.1.html</url></license>
  </licenses>
  <dependencies>
    <dependency>
      <groupId>androidx.media3</groupId>
      <artifactId>media3-decoder</artifactId>
      <version>$MEDIA3_VERSION</version>
      <scope>compile</scope>
    </dependency>
    <dependency>
      <groupId>androidx.media3</groupId>
      <artifactId>media3-exoplayer</artifactId>
      <version>$MEDIA3_VERSION</version>
      <scope>runtime</scope>
    </dependency>
  </dependencies>
</project>
EOF

# The checkout and its build take over 1 GB; only the tarball is worth keeping for the next run.
rm -rf "$MEDIA3" "$UNPACKED"

echo "== Published $AAR"
unzip -l "$AAR" | grep 'jni/'
