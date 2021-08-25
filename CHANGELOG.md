## [1.2.1](https://github.com/alexandermendes/next-micro/compare/v1.2.0...v1.2.1) (2021-08-25)


### Bug Fixes

* prefer custom scripts for Next.js services ([e7e23c9](https://github.com/alexandermendes/next-micro/commit/e7e23c9a0c139956b048b1114cdaf93e3ab7233c))

# [1.2.0](https://github.com/alexandermendes/next-micro/compare/v1.1.0...v1.2.0) (2021-08-25)


### Bug Fixes

* close route watchers when the server closes ([7b0ba59](https://github.com/alexandermendes/next-micro/commit/7b0ba592e1f1587de88cab8546c24421ba5864e0))


### Features

* add env_* setting ([b69f3b7](https://github.com/alexandermendes/next-micro/commit/b69f3b70ae10e8aa349c3421c94ecb194adfc828))
* make logging for tagged services clearer ([5e4eb71](https://github.com/alexandermendes/next-micro/commit/5e4eb719dfb421a0fbae185f8892a8987c64fc9e))
* optimize watching for next route changes ([7cf38aa](https://github.com/alexandermendes/next-micro/commit/7cf38aa0941b0179ffc8c17954c9d7b95ff1c607))

# [1.1.0](https://github.com/alexandermendes/next-micro/compare/v1.0.1...v1.1.0) (2021-08-25)


### Bug Fixes

* support route matching for older next versions ([e6a3765](https://github.com/alexandermendes/next-micro/commit/e6a3765b20ec1ca057d5eea2a7f870d202cd3e85))


### Features

* add better feedback for clashing page routes ([a752cd5](https://github.com/alexandermendes/next-micro/commit/a752cd53d6f2b2093622a8096cb868d2593e6314))
* add ignore setting ([19fc95d](https://github.com/alexandermendes/next-micro/commit/19fc95d15834b0abe976aa64b8b65c0f2ca325d1))

## [1.0.1](https://github.com/alexandermendes/next-micro/compare/v1.0.0...v1.0.1) (2021-08-23)


### Bug Fixes

* close the proxy when the main server closes ([0ccb231](https://github.com/alexandermendes/next-micro/commit/0ccb2313cd4b32d30c28b17d53121133fe3332e2))

# 1.0.0 (2021-08-23)


### Bug Fixes

* handle service potentially being launched from multiple requests ([cc5c0f2](https://github.com/alexandermendes/next-micro/commit/cc5c0f2bbe7d70c813e650ac7f9105aec1fa7410))
* remove test port ([979bc6f](https://github.com/alexandermendes/next-micro/commit/979bc6f6541e8f81b38ce4fdbb1296e7bce3af12))
* rename bin script > nextmicro ([1530b5e](https://github.com/alexandermendes/next-micro/commit/1530b5e03f4d953e03783ac63a8629e57874ff96))


### Features

* add a fallback service name based on creation index ([d796890](https://github.com/alexandermendes/next-micro/commit/d7968900c7aa7784d8debb8ccd2186887a6c6ac8))
* add autostart option ([cebc8d4](https://github.com/alexandermendes/next-micro/commit/cebc8d4428a58e6b3810f01633881060cf37f118))
* add basic router ([07735e3](https://github.com/alexandermendes/next-micro/commit/07735e334af6220a34acfa583ad0e06e31165878))
* add cli witth basic dev option ([f6376fd](https://github.com/alexandermendes/next-micro/commit/f6376fdc49b192b6c85f684a2c39a18bd6b829a9))
* add config loader with basic validation ([e3e3351](https://github.com/alexandermendes/next-micro/commit/e3e3351964d5c612925371dacc696b4ffaa73934))
* add core server setup ([4f82738](https://github.com/alexandermendes/next-micro/commit/4f8273844d37037818f7c07608488aa66ebf4245))
* add custom logger ([e630729](https://github.com/alexandermendes/next-micro/commit/e630729ce8be5dcfb88ffde458732f25bcf0ff7a))
* add env opt ([70c44c3](https://github.com/alexandermendes/next-micro/commit/70c44c3550d38a247683219ea0dc423fc6717446))
* add option to launch services on startup ([b2c66ee](https://github.com/alexandermendes/next-micro/commit/b2c66ee39bcf1612fcf112e8ac3e1a87a5bc5bcb))
* add rootDir option ([da7b069](https://github.com/alexandermendes/next-micro/commit/da7b0698cf413c73bfb227d00d886bb656e9b833))
* add scriptWaitForTimeout option ([db79c96](https://github.com/alexandermendes/next-micro/commit/db79c965d9a54044a7d68fd239a5b8af19b0e929))
* add service startup mechanism ([4597a8e](https://github.com/alexandermendes/next-micro/commit/4597a8ef4609cefb4cf2955236e846b57dba0226))
* add start script validation ([97a9fab](https://github.com/alexandermendes/next-micro/commit/97a9fab9bc38a6df39a7519cca07e8d05cc97442))
* add ttl option ([6bfbe91](https://github.com/alexandermendes/next-micro/commit/6bfbe9191c51f0253687b5c524d4d1de7445e6b2))
* add version feedback to services ([c786cde](https://github.com/alexandermendes/next-micro/commit/c786cde09af37b6aae7d55d2d9f06b154436f88d))
* assign ports to services automatically ([6591751](https://github.com/alexandermendes/next-micro/commit/65917512ede0e3afe3509873cf47dc56e6f2d025))
* auto load next.js routes ([48c3058](https://github.com/alexandermendes/next-micro/commit/48c30582596708ed485139a99b5d9b04e99b65ff))
* begin next.js route support ([7c3020b](https://github.com/alexandermendes/next-micro/commit/7c3020bb7d521a37ef7370f9528643e087b383f5))
* continue adding Next.js support ([cb96b80](https://github.com/alexandermendes/next-micro/commit/cb96b80327da809f0abcabedca4cb0aff57dfb5f))
* get basic server up and running ([81fdc2d](https://github.com/alexandermendes/next-micro/commit/81fdc2de0cf6c4521182494723d508169a6ae26c))
* launch next services automatically ([d4348b0](https://github.com/alexandermendes/next-micro/commit/d4348b0a282ace6f425bc464f0d630d1c61926f9))
* watch for route changes in dev mode ([f13c8b3](https://github.com/alexandermendes/next-micro/commit/f13c8b35596f62551ac84b698f08686f297b197e))
