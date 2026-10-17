# FFmpeg in Divano

Divano's Android app plays some audio formats (AC-3, E-AC-3, MPEG audio layers 1–3) with [FFmpeg](https://ffmpeg.org), when the device has no decoder of its own for them. FFmpeg
is licensed under the [GNU LGPL version 2.1 or later](https://www.gnu.org/licenses/old-licenses/lgpl-2.1.html);
it is linked into `libffmpegJNI.so`, a shared library of the app that can be replaced. This page
holds the exact source of the FFmpeg the app ships and how it was built.

## Source

| | |
|---|---|
| FFmpeg | 6.0.1, the unmodified release tarball: [ffmpeg-6.0.1.tar.xz](ffmpeg-6.0.1.tar.xz) (also at [ffmpeg.org](https://ffmpeg.org/releases/ffmpeg-6.0.1.tar.xz)) |
| SHA-256 | `9b16b8731d78e596b4be0d720428ca42df642bb2d78342881ff7f5bc29fc9623` |
| Licence | LGPL 2.1 or later: the tarball's `COPYING.LGPLv2.1` and `LICENSE.md`. Configured without `--enable-gpl` and `--enable-nonfree` |

## How it was built

1. [build-ffmpeg-decoder.sh](build-ffmpeg-decoder.sh), Divano's build script: it checks out
   [Media3](https://github.com/androidx/media) 1.11.1, unpacks the tarball above into its FFmpeg
   extension (`libraries/decoder_ffmpeg`), builds FFmpeg with the decoders `ac3 eac3 mp3`
   for armeabi-v7a, arm64-v8a, x86 and x86_64 (NDK r26b, API 26), links the JNI library with 16 KB
   pages and strips it.
2. [media3-1.11.1-build_ffmpeg.sh](media3-1.11.1-build_ffmpeg.sh), Media3's own script that the
   one above calls, with FFmpeg's `configure` options (Apache License 2.0, © The Android Open
   Source Project).

FFmpeg itself is not modified. To use a modified FFmpeg, rebuild `libffmpegJNI.so` with these
scripts from your sources and replace it in the app.

Divano doesn't use FFmpeg's name or logo to promote itself; FFmpeg is a trademark of Fabrice Bellard.
