# Maths Trail

이 폴더에는 PDF 문제지를 이미지로 추출해 만든 Maths Trail 웹앱이 들어 있습니다.

## 실행

이미 실행 중인 로컬 미리보기:

```text
http://127.0.0.1:4173/
```

직접 다시 실행하려면:

```powershell
cd C:\Users\BTY\Desktop\maths_trail\site
python -m http.server 4173 --bind 127.0.0.1
```

## 사용 흐름

1. `Trail` 화면에서 시작 circle number를 선택합니다.
2. 현재 문제를 풀고, 답과 같은 `previous answer` 이미지를 선택합니다.
3. 선택 전에 확인창이 뜨며, 확인하면 선택한 circle number가 기록지의 다음 빈칸에 들어갑니다.
4. 선택한 circle number의 문제가 다음 문제로 표시됩니다.
5. 이미 기록된 circle number는 선택지에서 사라집니다.
6. 잘못 선택했으면 기록지의 번호 또는 `마지막 삭제`를 눌러 되돌립니다. 삭제된 번호는 선택지에 다시 나타납니다.
7. `전체 문제` 화면에서 12개 문제 카드를 볼 수 있습니다.

## 파일 구조

- `site/index.html`: 웹앱
- `site/styles.css`: 화면 스타일
- `site/app.js`: Trail 진행 동작
- `site/assets/problems`: 문제 카드 이미지 12개
- `site/assets/answers`: previous answer 선택지 이미지 12개
- `tools/extract_assets.py`: PDF 렌더링 이미지에서 웹앱용 자산을 다시 추출하는 스크립트
