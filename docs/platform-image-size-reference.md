# Platform Image Size Reference (source of truth)

> Verified via You.com research on **2026-08-30**. Every row must keep a source URL and a source
> status. Do NOT add a placement, a pixel dimension, or a file-size limit to this file or to the
> application catalog without a citable source. If a platform publishes no specification, the
> placement is excluded rather than filled in with a guess.

## Source status vocabulary

| Status | Meaning |
| --- | --- |
| `official` | Dimensions, ratio, and limits come from the platform's own documentation. |
| `official-ratio-derived-canvas` | The platform officially documents the ratio and/or a width or file limit, but not the exact pixel canvas. The canvas is a third-party production recommendation consistent with the official rule. |
| `official-ads-doc` | The figure comes from the platform's own documentation, but from its **advertising** specs rather than organic posting specs. |

## Included placements (13)

| Value | Platform | Placement | Canvas | Ratio | Documented file limit | Source status | Source |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `instagram-feed-square` | Instagram | Feed — Square | 1080 × 1080 | 1:1 | 8 MB (third-party) | `official-ratio-derived-canvas` | [Instagram Help][ig], [Buffer][buf-help] |
| `instagram-feed-portrait` | Instagram | Feed — Portrait | 1080 × 1350 | 4:5 | 8 MB (third-party) | `official-ratio-derived-canvas` | [Instagram Help][ig], [Buffer][buf-help] |
| `instagram-feed-landscape` | Instagram | Feed — Landscape | 1080 × 566 | 1.91:1 | 8 MB (third-party) | `official-ratio-derived-canvas` | [Instagram Help][ig], [Buffer][buf-help] |
| `instagram-stories` | Instagram | Stories | 1080 × 1920 | 9:16 | 30 MB (ads doc) | `official-ads-doc` | [Meta Stories Ads][meta-stories] |
| `facebook-feed-square` | Facebook | Feed — Square | 1080 × 1080 | 1:1 | not documented for organic posts | `official-ratio-derived-canvas` | [Meta placement pixel requirements][meta-px], [Dash Social][dash] |
| `facebook-feed-portrait` | Facebook | Feed — Portrait | 1080 × 1350 | 4:5 | not documented for organic posts | `official-ratio-derived-canvas` | [Meta placement pixel requirements][meta-px], [Dash Social][dash] |
| `facebook-stories` | Facebook | Stories | 1080 × 1920 | 9:16 | 30 MB (ads doc) | `official-ads-doc` | [Meta Stories Ads][meta-stories] |
| `x-instream-single-image` | X | In-stream single image | 1200 × 675 | 16:9 | 5 MB native; 20 MB Media Studio | `official-ratio-derived-canvas` | [X Help — posting pictures][x-post], [X Help — Media Studio][x-ms], [Buffer][buf] |
| `youtube-community-image` | YouTube | Community post image | 1080 × 1080 | 1:1 | 16 MB | `official-ratio-derived-canvas` | [YouTube Help — Create a post][yt-post] |
| `linkedin-single-image-portrait` | LinkedIn | Single image — Portrait | 1080 × 1350 | 4:5 | 5 MB | `official-ratio-derived-canvas` | [LinkedIn Help — Share photos][li] |
| `linkedin-single-image-square` | LinkedIn | Single image — Square | 1080 × 1080 | 1:1 | 5 MB | `official-ratio-derived-canvas` | [LinkedIn Help — Share photos][li] |
| `linkedin-single-image-landscape` | LinkedIn | Single image — Landscape | 1200 × 628 | 1.91:1 | 5 MB | `official-ratio-derived-canvas` | [LinkedIn Help — Share photos][li] |
| `pinterest-standard-pin` | Pinterest | Standard Pin | 1000 × 1500 | 2:3 | 20 MB desktop; 32 MB in-app | `official` | [Pinterest product specs][pin] |

### Officially documented constraints worth keeping visible

- **Instagram** documents a maximum width of 1080 px and an accepted ratio range of 1.91:1 to 4:5. The three feed canvases above sit inside that range; they are not three separately mandated sizes.
- **X** documents a 5 MB limit for native posting and states that ratios from 2:1 to 3:4 display in full. Media Studio allows up to 20 MB and a maximum resolution of 8192 × 8192. The 1200 × 675 canvas is a production recommendation, not a mandate.
- **LinkedIn** documents a 5 MB limit, a 552 × 276 px minimum, a recommended width of 1080 px, and supported ratios up to the 3:1–4:5 range.
- **YouTube** documents a 1:1 ratio and a 16 MB limit for community post images but no exact pixel canvas.
- **Pinterest** documents both the 2:3 ratio and the 1000 × 1500 canvas, plus its file limits. Pins taller than the recommended ratio may be truncated in the feed.
- **Meta Stories** figures come from Meta's Stories **Ads** documentation. They are used here as the practical organic Stories canvas, and the status field records that provenance.

## Excluded placements and the reason

| Platform / placement | Reason for exclusion |
| --- | --- |
| Threads feed | No official pixel recommendation found in Threads help documentation. |
| WhatsApp Status | No official canvas or image file limit found. Official documentation also notes HD media is unavailable for Status. |
| KASKUS thread image | Official help documents only accepted formats (JPG, PNG, SVG, GIF) and a maximum of 20 images per thread. No dimensions or file-size limit. A 512 KB figure appears only in an old community guide and must not be used. |
| TikTok photo post | Photo posting and a 35-item editing session are officially confirmed, but no pixel dimensions or organic file limit are documented. |
| Facebook feed landscape 1200 × 630 | This is a third-party link-preview recommendation, not a documented photo-post specification. |
| YouTube video thumbnail | Officially specified (1280 × 720, 16:9, min width 640 px), but it is a video thumbnail rather than an image post. Excluded by owner decision. |

Re-verify this file before adding any excluded placement. Platform specifications change.

[ig]: https://help.instagram.com/1631821640426723?helpref=hc_fnav
[buf-help]: https://support.buffer.com/article/617-ideal-image-sizes-and-formats-for-your-posts
[buf]: https://buffer.com/resources/social-media-image-sizes/
[meta-stories]: https://www.facebook.com/business/help/2222978001316177
[meta-px]: https://www.facebook.com/business/help/469767027114079
[dash]: https://www.dashsocial.com/blog/social-media-image-sizes
[x-post]: https://help.x.com/en/using-x/posting-gifs-and-pictures
[x-ms]: https://help.x.com/en/using-x/media-studio-faqs
[yt-post]: https://support.google.com/youtube/answer/7124474?hl=en&co=GENIE.Platform%3DDesktop
[li]: https://www.linkedin.com/help/lms/answer/a527229
[pin]: https://help.pinterest.com/en/business/article/pinterest-product-specs
