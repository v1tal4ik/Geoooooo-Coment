alert('This app use Yandex, use VPN to correctly working app, please !');

ymaps.ready(init);

const commentsOfPoints = JSON.parse(localStorage.getItem('MapPoints')) || {};
const addCommentBtn = document.getElementById('add-btn');
const redirectToComentBtn = document.getElementById('add-coment-btn');
const closeBtn = document.getElementById('close');
let clusterer;
let coords; // Current coords of Point


function init() {
  // initialization map
  const myMap = new ymaps.Map('map', {
    center: [50.44, 30.51],
    zoom: 12,
    controls: ['zoomControl', 'typeSelector', 'searchControl'],
  });


  // create clusterer
  clusterer = new ymaps.Clusterer({
    preset: 'islands#redClusterIcons',
    groupByCoordinates: false,
    clusterDisableClickZoom: true,
    openBalloonOnClick: false,
  });


  // add clusterer to map
  myMap.geoObjects.add(clusterer);
  renderPointsOfClusterer();


  // get coords on click
  myMap.events.add('click', async (e) => {
    coords = e.get('coords');
    const address = await getAddress(coords);
    openModalWindow({ address, coords, type: 'add' });
  });

  // actions of clusterer on click
  clusterer.events.add('click', async (e) => {
    const type = e.get('target').options._name;
    coords = e.get('target').geometry._coordinates;


    if (type === 'geoObject') {
      const address = await getAddress(coords);
      openModalWindow({ address, coords, type });
    }

    if (type === 'cluster') {
      const points = e.get('target').getGeoObjects();
      const arrayOfCoordinates = new Set();
      // create array of points coordinates
      points.forEach((item) => {
        const coordsPoint = item.geometry._coordinates.join(',');
        arrayOfCoordinates.add(coordsPoint);
      });
      openModalWindow({ address: ' ', coords: arrayOfCoordinates, type });
    }
  });
} // innit


const openModalWindow = ({ address, coords = '', type }) => {
  document.querySelector('.window').classList.remove('hide');
  document.querySelector('.address').textContent = address;
  const content1 = document.querySelector('.content_1');
  const content2 = document.querySelector('.content_2');

  if (type === 'add') {
    content1.classList.remove('hide');
    content2.classList.add('hide');
    content1.querySelector('.list').innerHTML = '';
    document.getElementById('place').value = address;
    renderComentsOnAddWindow({ coords, type: 'geoObject', add: true });
  }
  if (type === 'geoObject' || type === 'cluster') {
    content1.classList.add('hide');
    content2.classList.remove('hide');
    renderComentsOnAddWindow({ coords, type });
  }
};

const renderComentsOnAddWindow = ({ coords, type, add }) => {
  const number = (add) ? 1 : 2;
  const list = document.querySelector(`.content_${number}`).querySelector('.list');
  list.innerHTML = '';

  if (type === 'geoObject') {
    try {
      commentsOfPoints[coords].forEach((item) => {
        const element = createLi(item);
        list.appendChild(element);
      });
    } catch (e) {}
  }

  if (type === 'cluster') {
    coords.forEach((coords) => {
      commentsOfPoints[coords].forEach((data) => {
        list.appendChild(createLi(data));
      });
    });
  }
};


const renderPointsOfClusterer = () => {
  for (const prop in commentsOfPoints) {
    for (let i = 0; i < commentsOfPoints[prop].length; i++) {
      const coords = prop.split(',');
      clusterer.add(new ymaps.Placemark(coords, {}));
    }
  }
};


addCommentBtn.addEventListener('click', () => {
  const name = document.getElementById('name');
  const place = document.getElementById('place');
  const comment = document.getElementById('coment');
  const date = getTimeNow();
  const newComment = {
    name: name.value,
    place: place.value,
    date,
    comment: comment.value,
  };

  if (!commentsOfPoints[coords]) {
    commentsOfPoints[coords] = [];
  }

  commentsOfPoints[coords].push(newComment);
  localStorage.setItem('MapPoints', JSON.stringify(commentsOfPoints));
  if (typeof (coords) === 'string') {
    coords = coords.split(',');
  }
  clusterer.add(new ymaps.Placemark(coords, {}));
  renderComentsOnAddWindow({ coords, type: 'geoObject', add: true });

  name.value = '';
  comment.value = '';
});

closeBtn.addEventListener('click', (e) => {
  const window = document.querySelector('.window');
  window.classList.add('hide');
});


redirectToComentBtn.addEventListener('click', async (e) => {
  const address = await getAddress(coords);
  const arr = Object.keys(commentsOfPoints);
  arr.forEach((item) => {
    if (commentsOfPoints[item][0].place === address) {
      coords = item;
    }
  });
  openModalWindow({ address, coords, type: 'add' });
});


/** ************************** Helpers function ****************************************** */
const getAddress = coords => ymaps.geocode(coords).then(answer => answer.geoObjects.get(0).getAddressLine());


const getTimeNow = () => {
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
};


const createLi = ({name, place, date, comment,}) => {
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

  const spanDate = document.createElement('span');
  spanDate.classList.add('date');
  spanDate.textContent = date;

  info.appendChild(spanName);
  info.appendChild(spanPlace);
  info.appendChild(spanDate);

  const textDiv = document.createElement('div');
  textDiv.classList.add('text');
  textDiv.textContent = comment;

  li.appendChild(info);
  li.appendChild(textDiv);

  return li;
};
