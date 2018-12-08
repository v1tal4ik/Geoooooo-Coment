ymaps.ready(init);


var obj = {};
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
        clusterDisableClickZoom: true,
        openBalloonOnClick: false
    });

    /* Клік по кластеру */
    clusterer.events.add('click', (e) => {
        let type = e.get('target').options._name;
        

        if (type === 'cluster') {
            //клік по кластеру
            console.log('Це клік по кластеру');
            let points = e.get('target').getGeoObjects();
            let coordinates = e.get('target').geometry._coordinates;
            let array_coordinates = [];
            //відкривання модального вікна
                for(let point of points){
                    if(!(array_coordinates.includes(point.geometry._coordinates))){
                    array_coordinates.push(point.geometry._coordinates);    
                    }
            }
            showListComents(' ',array_coordinates,true);
        }

        if (type === 'geoObject') {
            //клік по мітці
            console.log('Це клік по мітці');
            let coordinates = e.get('target').geometry._coordinates;
            getAddress(coordinates).then((address) => {
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
        new_Coment = createObj(name.value, place.value, data, coment.value);
        if (obj[coords]) {
            obj[coords].push(new_Coment);
        } else {
            obj[coords] = [];
            obj[coords].push(new_Coment);
        }  
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

/******** Arrow ***********/
var right = document.getElementById('right');
var left = document.getElementById('left');
var counter = 0;
right.addEventListener('click', e =>{
    let list = document.querySelector('.content_2').querySelectorAll('.list-item');
    list[counter].classList.add('hide');
    list[counter+1].classList.remove('hide');
    counter+=1;
    //перевірка чи є далі слайди
    if(counter === (list.length-1)){
        right.classList.add('hide');
        left.classList.remove('hide');
    }else{
        left.classList.remove('hide');
    }
    
});

left.addEventListener('click', e =>{
   let list = document.querySelector('.content_2').querySelectorAll('.list-item');
    list[counter].classList.add('hide');
    list[counter-1].classList.remove('hide');
    counter-=1;
    //перевірка чи є далі слайди
    if(counter === 0){
        left.classList.add('hide');
        right.classList.remove('hide');
    }else{
        right.classList.remove('hide');
    }
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
function showListComents(address,coordinates,select) {
    let window = document.querySelector('.window');
    let content_1 = document.querySelector('.content_1');
    let content_2 = document.querySelector('.content_2');
    window.classList.remove('hide');
    content_1.classList.add('hide');
    content_2.classList.remove('hide');
    

    let address_span = document.querySelector('.address');
    address_span.textContent = address;
    renderComents(2,coordinates,select);
    }

function renderComents(number, coordinates, select = false) {
    let curentList;

    //номер списку
    if (number === 1) {
        curentList = document.querySelector('.content_1').querySelector('.list');
    }

    if (number === 2) {
        curentList = document.querySelector('.content_2').querySelector('.list');
    }
    curentList.innerHTML = '';
    //масив координат
    if (select) {
        //для всіх точок всі коментарі
        for (let i = 0; i < coordinates.length; i++) {
            for (let index of obj[coordinates[i]]) {
                let element = createLi(index.name, index.place, index.data, index.coment)
                curentList.appendChild(element);
            }
        }
    } else {
        //всі коментарі для даної точки
        for (let index of obj[coordinates]) {
            let element = createLi(index.name, index.place, index.data, index.coment)
            curentList.appendChild(element);
        }
    }
    clearList();
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

function createObj(name, place, data, coment) {
    let obj = {};
    obj.name = name;
    obj.place = place;
    obj.data = data;
    obj.coment = coment;
    console.log(obj);
    return obj;
}

function clearList(){
    console.log('work');
    let list = document.querySelector('.content_2').querySelectorAll('.list-item');
    for(let i=1; i <list.length;i++){
        list[i].classList.add('hide');
    }
    if(list.length !== 1){
        right.classList.remove('hide');
    }else{
        right.classList.add('hide');
    }
}

