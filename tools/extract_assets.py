from pathlib import Path
from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
RENDER_DIR = ROOT / "tmp" / "rendered_high"
ASSET_DIR = ROOT / "site" / "assets"


def crop_scaled(image, box_160):
    scale_x = image.width / 1820
    scale_y = image.height / 2573
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
    for directory in (problems_dir, answers_dir):
        directory.mkdir(parents=True, exist_ok=True)

    # Coordinates are based on a 220 DPI A4 render (1820 x 2573). The current
    # PDF has one full card per page, so the same crop applies to each page.
    card_box = (115, 118, 1668, 2408)
    answer_box = (848, 155, 1620, 575)

    problem_number = 1
    for page_number in range(1, 13):
        page_path = RENDER_DIR / f"problem-{page_number:02d}.png"
        page = Image.open(page_path).convert("RGB")

        card = crop_scaled(page, card_box)
        answer = crop_scaled(page, answer_box)
        card.save(problems_dir / f"problem-{problem_number:02d}.jpg", quality=94, optimize=True)
        answer.save(answers_dir / f"answer-{problem_number:02d}.png", optimize=True)
        problem_number += 1

    print(f"Extracted {problem_number - 1} problem cards and answer choices.")


if __name__ == "__main__":
    main()
