#!/usr/bin/env python3
"""Turn the Kiswahili artwork into the three files the site actually serves.

The originals are Play-sized (512x512 icon, 1024x500 feature graphic) and too
heavy to ship as-is: the export has `images.unoptimized = true`, so whatever
lands in public/ is exactly what the browser downloads.

Outputs:
    public/apps/swahili/icon.png       192x192, matching every other /apps icon
    public/apps/swahili/feature.webp   1024x500 feature graphic, re-encoded
    public/brand/og-swahili.jpg        1200x630 share card, derived from the
                                       feature graphic

The feature graphic is 2.05:1 and the og:image ratio is 1.90:1, so the card is
made by scaling to 1200 wide and extending the top and bottom 22 px with their
own edge rows. The background there is a near-flat gradient, so replicating one
row is invisible; cropping the sides instead would eat into the left margin.

Usage:
    python scripts/make-swahili-assets.py ICON.png FEATURE.png
"""
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
APPS = ROOT / "public" / "apps" / "swahili"
BRAND = ROOT / "public" / "brand"

OG_SIZE = (1200, 630)


def make_icon(src: Path) -> None:
    im = Image.open(src).convert("RGB")
    im = im.resize((192, 192), Image.LANCZOS)
    # Palette PNG: the icon is a two-colour gradient plus flat vector art, so
    # 256 entries with dithering hold it with no visible banding and drop it
    # from ~250 KB to the same range as the sibling icons.
    out = im.quantize(colors=256, method=Image.MEDIANCUT,
                      dither=Image.FLOYDSTEINBERG)
    APPS.mkdir(parents=True, exist_ok=True)
    out.save(APPS / "icon.png", optimize=True)


def make_feature(src: Path) -> None:
    im = Image.open(src).convert("RGB")
    if im.size != (1024, 500):
        im = im.resize((1024, 500), Image.LANCZOS)
    APPS.mkdir(parents=True, exist_ok=True)
    im.save(APPS / "feature.webp", "WEBP", quality=82, method=6)


def make_og(src: Path) -> None:
    im = Image.open(src).convert("RGB")
    width, height = OG_SIZE
    scaled = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)

    pad = height - scaled.height
    if pad < 0:
        # Taller than the card: crop the overflow evenly rather than squash it.
        top = -pad // 2
        scaled = scaled.crop((0, top, width, top + height))
        card = scaled
    else:
        card = Image.new("RGB", OG_SIZE)
        # Extend with the edge rows, which is what the gradient does anyway.
        top_band = scaled.crop((0, 0, width, 1)).resize(
            (width, pad // 2 + pad % 2), Image.NEAREST)
        bottom_band = scaled.crop((0, scaled.height - 1, width, scaled.height)).resize(
            (width, pad // 2), Image.NEAREST)
        card.paste(top_band, (0, 0))
        card.paste(scaled, (0, top_band.height))
        card.paste(bottom_band, (0, top_band.height + scaled.height))

    BRAND.mkdir(parents=True, exist_ok=True)
    card.save(BRAND / "og-swahili.jpg", "JPEG", quality=84, optimize=True,
              progressive=True)


def main() -> None:
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    icon, feature = Path(sys.argv[1]), Path(sys.argv[2])
    make_icon(icon)
    make_feature(feature)
    make_og(feature)
    for path in (APPS / "icon.png", APPS / "feature.webp", BRAND / "og-swahili.jpg"):
        im = Image.open(path)
        print(f"{path.relative_to(ROOT)}  {im.size[0]}x{im.size[1]}  "
              f"{path.stat().st_size / 1024:.1f} KB")


if __name__ == "__main__":
    main()
