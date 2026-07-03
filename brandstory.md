# ReFashion Premium Layout Guide (Shapes & Composition)

## Philosophy

Không lặp lại bố cục "text + image". Mỗi section phải có một hình dạng
(shape) và nhịp điệu riêng để tạo cảm giác khám phá.

## Section 1 -- Hero

-   Shape: Organic Blob hoặc Rounded Asymmetric Window.
-   Layout: 45% text \| 55% video.
-   Animation: Blob mask reveal, slow zoom, floating light.

ASCII:

``` text
      _________
   .-'         '-.
  /    VIDEO      \
 |                |
  \              /
   '-._________.-'
```

## Section 2 -- The Problem

-   Hai ảnh xếp lệch (staggered collage): landfill ở trên trái, forest
    dưới phải.
-   Scroll chuyển trọng tâm từ landfill sang forest.
-   Animation: image reveal + counter.

ASCII:

``` text
+-----------+
| Landfill  |
+-----+-----+
      |
      v
   +---------+
   | Forest  |
   +---------+
```

## Section 3 -- Our Belief

-   Collage 4 ảnh hình tròn.
-   Mỗi circle đại diện một công đoạn upcycling.
-   Hover: rotate 3° và scale nhẹ.

ASCII:

``` text
    ○
 ○     ○
    ○
```

## Section 4 -- Journey

-   Timeline cong với 5 glass cards.
-   SVG path tự vẽ khi scroll.

ASCII:

``` text
──╮
  ○──╮
     ○──╮
        ○──╮
           ○
```

## Section 5 -- Marketplace

-   Masonry gallery.
-   Không dùng lưới đều.

ASCII:

``` text
+----+ +--------+
|    | |        |
+----+ |        |
       +--------+
+-----------+
|           |
+-----------+
```

## Section 6 -- GreenCoin

-   Dashboard ở giữa.
-   Coin nổi xung quanh theo quỹ đạo.

ASCII:

``` text
   ○     ○

 [Dashboard]

   ○     ○
```

## Section 7 -- Community

-   Avatar dạng mạng lưới.
-   Bezier lines kết nối.

ASCII:

``` text
 ○──○
  \ |
   ○──○
  /
 ○
```

## Section 8 -- Impact & CTA

-   Video full-width.
-   Counter glass nổi trên video.
-   CTA cuối màn hình.

ASCII:

``` text
=====================
      VIDEO
=====================
  ○  ○  ○  Counters
```

## Shape Library

1.  Organic Blob
2.  Arch Window
3.  Circle
4.  Floating Glass Card
5.  Masonry Tiles

## Motion Language

-   Fade Up
-   Mask Reveal
-   Scale In
-   Morph Shape
-   Parallax
-   Floating
-   SVG Draw
-   Count Up

## Antigravity Rules

-   Mỗi section chỉ có 1 media chính.
-   Không slider.
-   Không lặp bố cục giữa các section.
-   Whitespace lớn (120--160px).
-   Border radius 24--40px.
-   Motion tinh tế, không bounce.
-   Desktop: đa dạng bố cục; Mobile: xếp dọc nhưng giữ shape.
