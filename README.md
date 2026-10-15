# Âme — главная страница

```
npm install
npm run dev
```

## Структура

```
src/
  components/
    header/
      Header.jsx        — шапка в стиле Aurelle: кремовая полоса → молочное стекло при скролле
      MobileMenu.jsx    — полноэкранное меню (< 1280px)
      SearchPanel.jsx   — выпадающая панель поиска
      LangSwitch.jsx    — UA / EN
      RollingText.jsx   — «перекатывающийся» hover текста (как у Gownora)
      icons.jsx
    hero/
      Hero.jsx          — полноэкранное видео + крупное «ÂME» (в духе Gownora)
    catalog/
      ProductCard.jsx       — карточка в стиле Aurelle + ♡, размеры, скидка, SOLD OUT
      ProductShowcase.jsx   — заголовок + «Показати все» + сетка 3 или 4 колонки
    home/
      RegionModal.jsx   — «Куди доставляємо?» при первом визите (Україна → UA, Worldwide → EN)
      Banner.jsx        — полноширинный крупный план с параллаксом
      Footer.jsx        — язык, ссылки, соцсети, подписка на рассылку, большой «ÂME»
    ui/Button.jsx       — кнопка с «перекатом» текста
  data/products.js      — 12 демо-товаров: corsetEdit (6) и allProducts (12)
  lib/i18n.js           — тексты UA/EN, форматирование цен в ₴
  lib/motion.js         — общая кривая EASE = [0.22, 1, 0.36, 1]
  index.css             — палитра, шрифт Playfair (font-display / font-wordmark)
public/media/           — видео для hero (desktop 16:9, mobile 9:16) + постеры
public/products/        — фото товаров: <id>.jpg (образ) и <id>-detail.jpg (деталь)
public/CREDITS.md       — источники временных стоковых фото и видео (Pexels)
```

## Порядок секций (по структуре rummywhy.com/uk)

1. Header (Aurelle) 2. Окно выбора региона 3. Hero с видео 4. «Corset Edit» — 6 товаров, 3 в ряд
5. Полноширинный баннер 6. «Усі товари» — 12 товаров, 4 в ряд 7. Кнопка «Всі товари» 8. Footer

Выбор региона и список бажань хранятся в localStorage (`ame-region`, `ame-wishlist`).

## Header — props

| prop | по умолчанию | |
|---|---|---|
| `lang`, `onLangChange` | внутреннее состояние | язык UA/EN |
| `cartCount` | `0` | счётчик корзины «(0)» |
| `onCartClick` | ссылка на `/cart` | |
| `onSearch(q)` | переход на `/search?q=` | |
| `navItems` | Колекції / Індивідуальне пошиття / Про бренд | `[{ href, label }]` |
| `currentPath` | — | подчёркивает активный пункт |
| `accountHref` | `/account` | иконка личного кабинета |
| `transparentAtTop` | `false` | `true` — шапка прозрачная над hero до прокрутки |
| `topTone` | `'light'` | цвет текста в прозрачном режиме |

## Как повторить во Framer

**Шапка** — компонент с вариантами `Top` и `Scrolled`.
- `Top`: фон прозрачный, текст `#FAF8F5`; плитки слева/справа — Fill `rgba(250,248,245,0.15)`, Background Blur 12, высота 45.
- `Scrolled`: Fill `rgba(250,248,245,0.8)`, Background Blur 24, нижняя граница 1px `rgba(26,26,26,0.07)`, текст `#1A1A1A`, высота 80 → 64, логотип Scale 0.86.
- Переключение: Position Fixed, затем Effects → Scroll Variant (или Scroll Section) → `Scrolled` после 24px.
- Transition для всех вариантов: Ease, 0.6s, кривая `0.22, 1, 0.36, 1`.
- Ссылки «перекатом»: компонент-ссылка с двумя текстами в стеке с Overflow Hidden; вариант `Hover` сдвигает верхний на Y −100%, нижний с 100% на 0; 0.55s та же кривая.

**Карточка** — компонент с вариантами `Default` и `Hover` (Interactions → Hover → Hover).
- Рамка 1px `#E8DFD8`, фото-блок 4:5 с фоном `#EDE4DA`, подпись на `#F9F6F0`.
- Два изображения в одном Frame (Overflow Hidden): в `Default` фото образа Opacity 1 / Scale 1, деталь Opacity 0 / Scale 1.08; в `Hover` наоборот (образ Opacity 0 / Scale 1.04).
- Кнопка «Додати до кошика»: в `Default` Opacity 0, Y +14; в `Hover` Opacity 1, Y 0.
- Transition: 0.9s для фото, 0.55s для кнопки, кривая `0.22, 1, 0.36, 1`.
- Появление в сетке: Appear Effect → On Scroll In View, Opacity 0 → 1, Y 24 → 0, 0.9s, задержка +0.08s для каждой следующей карточки в ряду.

## Шрифт

Один шрифт на весь сайт — **Playfair** (Google Fonts, есть кириллица), Didone с осью оптического размера `opsz`:
- `font-wordmark` — `opsz 1200`, вес 300: максимальный контраст, только для латинского «ÂME».
- `font-display` — `opsz 200`, вес 300: крупные заголовки; на большем `opsz` тонкие диагонали кириллических «и», «й» пропадают.
- Мелкий текст — `opsz` подбирается браузером автоматически.
- Цифры принудительно «прописные» (`lnum`), иначе цены выглядят как «6 8oo».

Во Framer: Font → Playfair, Variable → Optical size 1200 для логотипа и 200 для заголовков.
