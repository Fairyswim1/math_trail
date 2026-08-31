from pathlib import Path
from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
RENDER_DIR = ROOT / "tmp" / "rendered_high"
ASSET_DIR = ROOT / "site" / "assets"


def crop_scaled(image, box_160):
    scale_x = image.width / 1869
    scale_y = image.height / 1323
    left, top, right, bottom = box_160
    box = (
        round(left * scale_x),
        round(top * scale_y),
        round(right * scale_x),
        round(bottom * scale_y),
    )
    return image.crop(box)


def main():
    problems_dir = ASSET_DIR / "problems"
    answers_dir = ASSET_DIR / "answers"
    pages_dir = ASSET_DIR / "pages"
    for directory in (problems_dir, answers_dir, pages_dir):
        directory.mkdir(parents=True, exist_ok=True)

    # Coordinates are based on the rendered 160 DPI page size, then scaled to
    # whatever resolution was rendered. The PDF has two cards per page.
    card_boxes = [
        (59, 59, 880, 1270),
        (994, 59, 1813, 1270),
    ]
    answer_boxes = [
        (463, 88, 852, 309),
        (1399, 88, 1787, 309),
    ]

    problem_number = 1
    for page_number in range(1, 7):
        page_path = RENDER_DIR / f"problem-{page_number}.png"
        page = Image.open(page_path).convert("RGB")
        page.save(pages_dir / f"page-{page_number:02d}.jpg", quality=92, optimize=True)

        for side in range(2):
            card = crop_scaled(page, card_boxes[side])
            answer = crop_scaled(page, answer_boxes[side])
            card.save(problems_dir / f"problem-{problem_number:02d}.jpg", quality=94, optimize=True)
            answer.save(answers_dir / f"answer-{problem_number:02d}.png", optimize=True)
            problem_number += 1

    print(f"Extracted {problem_number - 1} problem cards and answer choices.")


if __name__ == "__main__":
    main()
