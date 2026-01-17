# Antigravity RPA Engine

ブラウザの壁を超え、macOS全体をコントロールするための骨太なRPAスイートです。

## 構成

- `core.py`: マウス、キーボード、AppleScript、画像認識の基本操作。
- `scenarios/`: 特定の動作（例：起動、バックアップ、一括操作）を定義する場所。
- `assets/`: ボタンやアイコンなどの画像認識用テンプレート。

## 実行方法

```bash
# 基本的な起動シナリオを実行
python3 automation/rpa_engine/scenarios/boot_civilization.py
```

## 注意事項

- **アクセシビリティ権限**: 実行には Mac の「システム設定 > プライバシーとセキュリティ > アクセシビリティ」で、実行元のアプリ（ターミナルなど）を許可する必要があります。
- **Fail-Safe**: 何かあった時はマウスを画面の **「左上隅」** に叩きつけてください。スクリプトが強制停止します。

## 拡張のヒント

`rpa.find_image_on_screen("assets/submit_button.png")` を使うことで、座標に依存しない「ボタンを見て押す」操作が可能です。
アイコン画像を `assets/` に保存して、`core.py` の関数を呼び出すだけです。
