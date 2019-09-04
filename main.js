ymaps.ready(init);


const obj = {};
const addBtn = document.getElementById('add-btn');
const addComentBtn = document.getElementById('add-coment-btn');
const closeBtn = document.getElementById('close');
let coords = 0; // current coordinates Point


function init() {
  // Ініціалізація карти
  const myMap = new ymaps.Map('map', {
    center: [50.44, 30.51],
    zoom: 12,
    controls: ['zoomControl', 'typeSelector', 'searchControl'],
  });


  // отримання координат по кліку
  myMap.events.add('click', async (e) => {
    coords = e.get('coords');
    // отримання назви вулиці
    const address = await getAddress(coords);
    showWindow(address, coords);
  });

  // створення кластера
  const clusterer = new ymaps.Clusterer({
    preset: 'islands#redClusterIcons',
    groupByCoordinates: false,
    clusterDisableClickZoom: true,
    openBalloonOnClick: false,
  });

  // Клік по кластеру
  clusterer.events.add('click', async (e) => {
    const type = e.get('target').options._name;


    if (type === 'cluster') {
      // клік по кластеру
      const points = e.get('target').getGeoObjects();
      const coordinates = e.get('target').geometry._coordinates;
      const arrayOfCoordinates = [];
      // відкривання модального вікна
      for (const point of points) {
        if (!(arrayOfCoordinates.includes(point.geometry._coordinates))) {
          arrayOfCoordinates.push(point.geometry._coordinates);
        }
      }
      showListComents(' ', arrayOfCoordinates, true);
    }

    if (type === 'geoObject') {
      // клік по мітці
      const coordinates = e.get('target').geometry._coordinates;
      const address = await getAddress(coordinates);
      showListComents(address, coordinates);
    }
  });

  // /добавлення кластера на карту
  myMap.geoObjects.add(clusterer);


  addBtn.addEventListener('click', (e) => {
    const name = document.getElementById('name');
    const coment = document.getElementById('coment');
    const data = getTimeNow();


    // запис властивостей в обєкт
    const newComent = createObj(name.value, place.value, data, coment.value);
    if (obj[coords]) {
      obj[coords].push(newComent);
    } else {
      obj[coords] = [];
      obj[coords].push(newComent);
    }
    renderComents(1, coords);

    // додавання мітки
    const point = createPlacemark(coords);
    clusterer.add(point);

    name.value = '';
    coment.value = '';
  });
} // innit


// фунціонал кнопки addComentBtn
addComentBtn.addEventListener('click', (e) => {
  const address = document.querySelector('.address').textContent;
  showWindow(address, coords);
});


// фунціонал кнопки closeBtn
closeBtn.addEventListener('click', (e) => {
  const window = document.querySelector('.window');
  window.classList.add('hide');
});

// Arrow
const right = document.getElementById('right');
const left = document.getElementById('left');
let counter = 0;
right.addEventListener('click', (e) => {
  const list = document.querySelector('.content_2').querySelectorAll('.list-item');
  list[counter].classList.add('hide');
  list[counter + 1].classList.remove('hide');
  counter += 1;
  // перевірка чи є далі слайди
  if (counter === (list.length - 1)) {
    right.classList.add('hide');
    left.classList.remove('hide');
  } else {
    left.classList.remove('hide');
  }
});

left.addEventListener('click', (e) => {
  const list = document.querySelector('.content_2').querySelectorAll('.list-item');
  list[counter].classList.add('hide');
  list[counter - 1].classList.remove('hide');
  counter -= 1;
  // перевірка чи є далі слайди
  if (counter === 0) {
    left.classList.add('hide');
    right.classList.remove('hide');
  } else {
    right.classList.remove('hide');
  }
});


// створення мітки
function createPlacemark(coords) {
  return new ymaps.Placemark(coords, {});
}

// відкриття форми додавання коментаря
function showWindow(address, coordinates) {
  document.querySelector('.window').classList.remove('hide');
  document.querySelector('.content_1').classList.remove('hide');
  document.querySelector('.content_2').classList.add('hide');

  // встановлення в поля адрес
  document.querySelector('.address').textContent = address;
  document.getElementById('place').value = address;

  renderComents(1, coordinates);
}

// відкриття форми перегляду
function showListComents(address, coordinates, select) {
  document.querySelector('.window').classList.remove('hide');
  document.querySelector('.content_2').classList.remove('hide');
  document.querySelector('.content_1').classList.add('hide');
  document.querySelector('.address').textContent = address;

  renderComents(2, coordinates, select);
}

function renderComents(number, coordinates, select = false) {
  let curentList;

  // номер списку
  if (number === 1) {
    curentList = document.querySelector('.content_1').querySelector('.list');
  }

  if (number === 2) {
    curentList = document.querySelector('.content_2').querySelector('.list');
  }
  curentList.innerHTML = '';
  // масив координат
  if (select) {
    // для всіх точок всі коментарі
    for (let i = 0; i < coordinates.length; i++) {
      for (const index of obj[coordinates[i]]) {
        const element = createLi(index.name, index.place, index.data, index.coment);
        curentList.appendChild(element);
      }
    }
  } else {
    // всі коментарі для даної точки
    for (const index of obj[coordinates]) {
      const element = createLi(index.name, index.place, index.data, index.coment);
      curentList.appendChild(element);
    }
  }
  clearList();
}

function getAddress(coords) {
  return new Promise((resolve) => {
    ymaps.geocode(coords).then(answer => resolve(answer.geoObjects.get(0).getAddressLine()));
  });
}

function getTimeNow() {
  let today = new Date();
  let dd = today.getDate();
  let mm = today.getMonth() + 1; // January is 0!
  const yyyy = today.getFullYear();

  if (dd < 10) {
    dd = `0${dd}`;
  }

  if (mm < 10) {
    mm = `0${mm}`;
  }

  today = `${dd}.${mm}.${yyyy}`;
  return today;
}

function createLi(name, place, data, text) {
  const li = document.createElement('li');
  li.classList.add('list-item');

  const info = document.createElement('div');
  info.classList.add('info');

  const spanName = document.createElement('span');
  spanName.classList.add('name');
  spanName.textContent = `${name}  `;

  const spanPlace = document.createElement('span');
  spanPlace.classList.add('place');
  spanPlace.textContent = `${place}  `;

  const spanData = document.createElement('span');
  spanData.classList.add('data');
  spanData.textContent = data;

  info.appendChild(spanName);
  info.appendChild(spanPlace);
  info.appendChild(spanData);

  const textDiv = document.createElement('div');
  textDiv.classList.add('text');
  textDiv.textContent = text;

  li.appendChild(info);
  li.appendChild(textDiv);

  return li;
}

function createObj(name, place, data, coment) {
  const obj = {};
  obj.name = name;
  obj.place = place;
  obj.data = data;
  obj.coment = coment;
  return obj;
}

function clearList() {
  const list = document.querySelector('.content_2').querySelectorAll('.list-item');
  for (let i = 1; i < list.length; i++) {
    list[i].classList.add('hide');
  }
  if (list.length !== 1) {
    right.classList.remove('hide');
  } else {
    right.classList.add('hide');
  }
}
