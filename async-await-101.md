# `async` `await` 101

Tämä dokumentti selittää lyhyesti miten `async` ja `await` toimivat, lähtien edellisen koodin mukaisista callback käytöstä.

## 1. Callback

Callback on funktio joka annetaan funktiolle parametrina (korkeamman tason ohjelmointia), ja funktio kutsuu tätä sitten kun "on valmis". Näin tätä käytettävän joten lähden oletuksesta, että tiedetään miten tätä käytetään.

```javascript
function withCallback(onReady) {
    // Do something that takes a lot of time, like xmlhttprequest, or animation

    onReady(result);
}
```
```javascript
withCallback(function (result) {
    // Do something with the result
})
```
## 2. Promise

Promisen voi ajatella toimivan vähän samalla lailla kuin callback.

```javascript
function withPromise() {
    return new Promise((resolve, error) => {
        // Do something that takes a lot of time, like xmlhttprequest, or animation

        resolve(result);
    });
}
```
```javascript
withPromise()
    .then(result => {
        // Do something with the result
    })
    .catch(error => {

    })
```

Suurin ero callback kanssa on milloin Promisen metodia kutsutaan. Callback esimerkin `onReady` metodi ajetaan samantien. [Promisen `.then(result)` ajetaan joka kerta kun Javascriptin funktio-stack on tyhjä (video javascript ajosta)](https://www.youtube.com/watch?v=cCOL7MC4Pl0)

Tästä ei tarvitse välittää kauheasti. Voi ajatella että Promise ajetaan silloin "kun se on hyvä ajaa"

## 3. `async` `await`

Async ja Await rakentavat sitten Promisen päälle.

```javascript
async function doStuff() {
    const result = await withPromise();
}
```
on sama asia kuin
```javascript
withPromise().then(doStuff);
```

Tietenkin tämä menee vaikeammaksi selittää kun funktion sisällä on useampi `await`, mutta pää-asia on, että funktio "odottaa" että metodi on valmis. (*Koska javascript on single-thread niin "odotus" ei oikeasti pysäytä ajoa vaan ajo jatkuu tästä kohdasta kun toisten asioiden ajaminen on valmista*)

Jos haluaa tietää lisää niin kannattaa tutustua jossain muualla vielä aiheeseen lisää.

## Koodi repositoriossa

Tämän repositorion koodissa käytetään awaittia mm.

- XMLHTTPRequest pyyntöjen valmistumisten kanssa
    - Pelin tietojen lataus
    - MOOC & quizzes yhteydet
- Animaatioiden odottamiseen
- Käyttäjän toimintojen odottamiseen (mm. Modal-ikkunan sulkeminen)