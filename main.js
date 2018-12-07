ymaps.ready(init);



var all_placemarks = [
    {
        coords: [50.40, 30.20],
        name: 'viyaliy',
        place: 'Европейский',
        data: '06.12.2018',
        coment: 'dcd'
    }
]
var add_btn        = document.getElementById('add-btn');
var add_coment_btn = document.getElementById('add-coment-btn');
var close_btn      = document.getElementById('close');
var coords = 0; //current coordinates Point



function init() {
    // Ініціалізація карти
    var myMap = new ymaps.Map("map", {
        center: [50.44, 30.51],
        zoom: 12,
        controls: ['zoomControl', 'typeSelector', 'searchControl']
    });


    //отримання координат по кліку
    myMap.events.add('click', (e) => {
        console.log('Це клік по карті');
        coords = e.get('coords');
        //отримання назви вулиці
        getAddress(coords).then((address) => {
            console.log('address', address);
            //відкривання модального вікна
            showWindow(address,coords);
        });
    });

    /*створення кластера*/
    var clusterer = new ymaps.Clusterer({
        preset: 'islands#redClusterIcons',
        groupByCoordinates: false,
    });

    /* Клік по кластеру */
    clusterer.events.add('click', (e) => {
        let type = e.get('target').options._name;
        

        if (type === 'cluster') {
            //клік по кластеру
            console.log('Це клік по кластеру');
            let arr = clusterer.getGeoObjects();
            for (let i = 0; i < arr.length; i++) {
                let coordinates = arr[i].geometry._coordinates;
                 let window = document.querySelector('.window');
                let content_1 = document.querySelector('.content_1');
                let content_2 = document.querySelector('.content_2');
                window.classList.remove('hide');
                content_1.classList.add('hide');
                content_2.classList.remove('hide');
                renderComents(2,coordinates);
            }
        }

        if (type === 'geoObject') {
            //клік по мітці
            console.log('Це клік по мітці');
            let coordinates = e.get('target').geometry._coordinates;
            console.log('coordinates', coordinates);
            getAddress(coordinates).then((address) => {
            console.log('address', address);
            //відкривання модального вікна
            showListComents(address,coordinates);
        });
        }
    });

    ///добавлення кластера на карту
    myMap.geoObjects.add(clusterer);
    
    
    
    add_btn.addEventListener('click', e => {
    let name = document.getElementById('name');
    let coment = document.getElementById('coment');
    let data = getTimeNow();


    //запис властивостей в обєкт
    let obj = createObj(coords, name.value, place.value, data, coment.value);
    all_placemarks.push(obj);    
    renderComents(1,coords);
    
    //додавання мітки
    let point = createPlacemark(coords);
    clusterer.add(point);
    console.log('мітка добавлена');
        
        name.value = '';
        coment.value = '';
});

} //innit





//фунціонал кнопки add_coment_btn
add_coment_btn.addEventListener('click',e=>{
        let address = document.querySelector('.address').textContent;
        showWindow(address,coords);
});


//фунціонал кнопки close_btn
close_btn.addEventListener('click', e => {
    let window = document.querySelector('.window');
    window.classList.add('hide');
});





//створення мітки 
function createPlacemark(coords) {
    return new ymaps.Placemark(coords, {});
}

//відкриття форми додавання коментаря
function showWindow(address,coordinates) {
    let window = document.querySelector('.window');
        let content_1 = document.querySelector('.content_1');
        let content_2 = document.querySelector('.content_2');
        window.classList.remove('hide');
        content_2.classList.add('hide');
        content_1.classList.remove('hide');

        //встановлення в поля адрес
        let address_span = document.querySelector('.address');
        let place = document.getElementById('place');
        address_span.textContent = address;
        place.value = address;
    
    renderComents(1,coordinates);
}

//відкриття форми перегляду
function showListComents(address,coordinates) {
    let window = document.querySelector('.window');
    let content_1 = document.querySelector('.content_1');
    let content_2 = document.querySelector('.content_2');
    window.classList.remove('hide');
    content_1.classList.add('hide');
    content_2.classList.remove('hide');
    

    let list = document.querySelector('.content_2').querySelector('.list');
    list.innerHTML = ' ';
    let address_span = document.querySelector('.address');
    address_span.textContent = address;
    
    renderComents(2,coordinates);
    }

function renderComents(number,coordinates){
    let currentList;
    
    if(number === 1){
        currentList = document.querySelector('.content_1').querySelector('.list');
    }
    
    if(number === 2){
        currentList = document.querySelector('.content_2').querySelector('.list');
    }
    
    currentList.innerHTML = '';
    
    for (let array_all of all_placemarks) {
        console.log('coordinates ', coordinates, ' ==== ', array_all.coords);
        console.log('OBJECT ', array_all);
        if (checkArrays(coordinates, array_all.coords)) {
            let element = createLi(array_all.name, array_all.place, array_all.data, array_all.coment);
//            address_span.textContent = array_all.place;
            currentList.appendChild(element);
        }
    }
}

function getAddress(coords) {
    return new Promise((resolve) => {
        ymaps.geocode(coords).then((answer) => {
            return resolve(answer.geoObjects.get(0).getAddressLine());
        });
    });
}

function getTimeNow() {
    let today = new Date();
    let dd = today.getDate();
    let mm = today.getMonth() + 1; //January is 0!
    let yyyy = today.getFullYear();

    if (dd < 10) {
        dd = '0' + dd
    }

    if (mm < 10) {
        mm = '0' + mm
    }

    today = dd + '.' + mm + '.' + yyyy;
    return today;
}

function createLi(name, place, data, text) {
    let li = document.createElement('li');
    li.classList.add('list-item');

    let info = document.createElement('div');
    info.classList.add('info');

    let span_name = document.createElement('span');
    span_name.classList.add('name');
    span_name.textContent = name + '  ';

    let span_place = document.createElement('span');
    span_place.classList.add('place');
    span_place.textContent = place + '  ';

    let span_data = document.createElement('span');
    span_data.classList.add('data');
    span_data.textContent = data;

    info.appendChild(span_name);
    info.appendChild(span_place);
    info.appendChild(span_data);

    let text_div = document.createElement('div');
    text_div.classList.add('text');
    text_div.textContent = text;

    li.appendChild(info);
    li.appendChild(text_div);

    return li;
}

function createObj(coords, name, place, data, coment) {
    let obj = {};
    obj.coords = coords;
    obj.name = name;
    obj.place = place;
    obj.data = data;
    obj.coment = coment;
    console.log(obj);
    return obj;
}

function checkArrays(array_check, array) {
    if (array_check[0] === array[0] && array_check[1] === array[1]) {
        console.log(array_check[0], ' === ', array[0]);
        console.log(array_check[1], ' === ', array[1]);
        console.log('return TRUE');
        return true;
    } else {
        console.log(array_check[0], ' === ', array[0]);
        console.log(array_check[1], ' === ', array[1]);
        console.log('return False');
        return false;
    }
}