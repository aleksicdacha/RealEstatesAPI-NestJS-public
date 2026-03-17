# Newsletter HTML Guide

## 📧 Slanje Newsletter-a sa HTML Sadržajem

Newsletter sistem sada podržava **HTML content** koji se bezbedno parsira i renderuje u emailovima.

---

## ✅ Dozvoljeni HTML Tagovi

### Naslovi
```html
<h1>Glavni Naslov</h1>
<h2>Podnaslov</h2>
<h3>Manji Naslov</h3>
```

### Tekst Formatiranje
```html
<p>Obični paragraf teksta.</p>
<strong>Boldovan tekst</strong>
<b>Boldovan tekst (alternativa)</b>
<em>Italic tekst</em>
<i>Italic tekst (alternativa)</i>
<u>Podvučen tekst</u>
<s>Precrtan tekst</s>
```

### Liste
```html
<ul>
  <li>Stavka 1</li>
  <li>Stavka 2</li>
</ul>

<ol>
  <li>Prva stavka</li>
  <li>Druga stavka</li>
</ol>
```

### Linkovi
```html
<a href="https://example.com">Klikni ovde</a>
<a href="mailto:info@example.com">Pošalji email</a>
```

### Slike
```html
<img src="https://example.com/slika.jpg" alt="Opis slike" width="300">
```

### Tabele
```html
<table>
  <thead>
    <tr>
      <th>Kolona 1</th>
      <th>Kolona 2</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Podatak 1</td>
      <td>Podatak 2</td>
    </tr>
  </tbody>
</table>
```

### Layout
```html
<div>Container</div>
<span>Inline element</span>
<br> <!-- Line break -->
<hr> <!-- Horizontal line -->
```

### Citati i Kod
```html
<blockquote>Citat ili važna poruka</blockquote>
<pre>Preformatirani tekst</pre>
<code>Kod primer</code>
```

---

## 🎨 Dozvoljeni CSS Stilovi

Možeš koristiti `style` atribut sa sledećim svojstvima:

### Boje
```html
<p style="color: #007bff;">Plavi tekst</p>
<p style="background-color: #f8f9fa;">Svetla pozadina</p>
```

### Font
```html
<p style="font-size: 18px;">Veći tekst</p>
<p style="font-weight: bold;">Boldovan tekst</p>
```

### Poravnanje
```html
<p style="text-align: center;">Centriran tekst</p>
<p style="text-align: right;">Desno poravnanje</p>
```

### Razmak
```html
<p style="margin: 20px;">Sa marginama</p>
<p style="padding: 15px;">Sa padding-om</p>
```

---

## 📝 Primeri Newsletter Sadržaja

### Primer 1: Jednostavan Newsletter
```html
<h1>Mesečne Novosti</h1>
<p>Poštovani pretplatnici,</p>

<p>Predstavljamo vam <strong>3 nove nekretnine</strong> koje su upravo ušle u našu ponudu.</p>

<h2>🏢 Luksuzni Stan - Centar</h2>
<p>3-soban, 85m², potpuno renoviran.</p>
<p style="color: #007bff; font-weight: bold;">Cena: 120,000 EUR</p>

<a href="https://example.com/property/1">Pogledaj detalje</a>

<hr>

<p style="text-align: center; color: #666;">
  Hvala što ste sa nama!
</p>
```

### Primer 2: Newsletter sa Slikama
```html
<h1 style="color: #007bff; text-align: center;">Novo u Ponudi</h1>

<div style="margin: 20px 0;">
  <h2>Vila sa Bazenom</h2>
  <img src="https://example.com/vila.jpg" alt="Vila" width="500">
  <p>Luksuzna vila sa bazenom i pogledom na more.</p>
  <ul>
    <li>5 spavaćih soba</li>
    <li>300m² površine</li>
    <li>2000m² placa</li>
  </ul>
  <a href="https://example.com/property/2">Pogledaj više</a>
</div>
```

### Primer 3: Newsletter sa Tabelom
```html
<h1>Cenovnik Usluga</h1>

<table style="width: 100%; border-collapse: collapse;">
  <thead>
    <tr style="background-color: #007bff; color: white;">
      <th style="padding: 10px; text-align: left;">Usluga</th>
      <th style="padding: 10px; text-align: right;">Cena</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">Procena vrednosti</td>
      <td style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">50 EUR</td>
    </tr>
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">Pravna pomoć</td>
      <td style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">150 EUR</td>
    </tr>
  </tbody>
</table>
```

### Primer 4: Kompletna Marketing Kampanja
```html
<div style="text-align: center;">
  <h1 style="color: #007bff;">🎉 Specijalna Ponuda!</h1>
  <h2 style="color: #666;">Samo ovog meseca</h2>
</div>

<div style="background-color: #fff3cd; padding: 20px; border-left: 4px solid #ffc107; margin: 20px 0;">
  <strong>💰 POPUST 10%</strong> na sve stanove u centru grada!
</div>

<h3>Izdvojene Nekretnine:</h3>

<div style="margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 8px;">
  <h4 style="margin-top: 0;">Stan 1 - Bulevar</h4>
  <p>2-soban, 55m², 3. sprat</p>
  <p style="font-size: 20px; color: #007bff; font-weight: bold;">75,000 EUR</p>
  <a href="https://example.com/property/1" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Pogledaj</a>
</div>

<div style="margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 8px;">
  <h4 style="margin-top: 0;">Stan 2 - Dorćol</h4>
  <p>3-soban, 72m², 5. sprat sa liftom</p>
  <p style="font-size: 20px; color: #007bff; font-weight: bold;">98,000 EUR</p>
  <a href="https://example.com/property/2" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Pogledaj</a>
</div>

<hr>

<p style="text-align: center; color: #999; font-size: 12px;">
  Ponuda važi do kraja meseca. Kontaktirajte nas za više informacija.
</p>
```

---

## 🔒 Sigurnost

Sistem **automatski sanitizuje** HTML sadržaj:
- ✅ Uklanja opasne tagove (`<script>`, `<iframe>`, itd.)
- ✅ Filtrira XSS napade
- ✅ Dozvoljava samo bezbedne URL scheme-e (`http`, `https`, `mailto`)
- ✅ Dodaje `target="_blank"` i `rel="noopener noreferrer"` na linkove

---

## 💡 Best Practices

### 1. Responsivnost
```html
<!-- Slike uvek sa max-width -->
<img src="url" alt="opis" style="max-width: 100%; height: auto;">
```

### 2. Boje
```html
<!-- Koristi hex boje ili rgb -->
<p style="color: #007bff;">Plavi tekst</p>
<p style="color: rgb(0, 123, 255);">RGB plavi</p>
```

### 3. Linkovi
```html
<!-- Uvek dodaj href -->
<a href="https://example.com">Klikni ovde</a>
<!-- NE samo: <a>Klikni ovde</a> -->
```

### 4. Struktura
```html
<!-- Dobro strukturiran sadržaj -->
<h1>Glavni Naslov</h1>
<h2>Sekcija 1</h2>
<p>Sadržaj sekcije...</p>
<h2>Sekcija 2</h2>
<p>Sadržaj sekcije...</p>
```

---

## ⚠️ Ograničenja

**Nisu podržani:**
- ❌ `<script>` tagovi (JavaScript)
- ❌ `<iframe>`, `<embed>`, `<object>`
- ❌ `<form>` elementi
- ❌ `data:` URL scheme
- ❌ Inline event handlers (`onclick`, `onload`, itd.)

---

## 🧪 Testiranje

Pre slanja newsletter-a:
1. Testiraj HTML u [HTML Viewer](https://htmledit.squarefree.com/)
2. Proveri kako izgleda na mobilnom (responsive)
3. Pošalji test email sebi prvo
4. Proveri da svi linkovi rade

---

## 📧 Primer Admin Forme

U admin panelu, newsletter forma izgleda ovako:

```
Subject: [Mesečne Novosti - Januar 2026]

Content:
┌─────────────────────────────────────────┐
│ <h1>Dobrodošli u Januar</h1>           │
│                                          │
│ <p>Predstavljamo <strong>5 novih       │
│ nekretnina</strong> u našoj ponudi.</p> │
│                                          │
│ <a href="https://...">Pogledaj sve</a>  │
└─────────────────────────────────────────┘

[Send to Selected] / [Send to All Active]
```

---

**Napomena:** Sav HTML sadržaj se automatski procesira i sanitizuje pre slanja. Ne moraš brinuti o bezbednosti!

---

**Datum:** Januar 2026  
**Verzija:** 2.0  
**Backend:** NestJS + Nodemailer + sanitize-html
