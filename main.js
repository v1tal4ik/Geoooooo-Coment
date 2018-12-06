ymaps.ready(init);


var all_placemarks = [
    {
        coords: [50.40, 30.20],
        name : 'viyaliy',
        place: 'Европейский',
        data: '06.12.2018',
        coment: 'dcd'
    }
]
var add_btn = document.getElementById('add-btn');
var close_btn = document.getElementById('close');

function init(){
// Ініціалізація карти
    var myMap = new ymaps.Map("map", {
            center: [50.44,30.51],
            zoom: 12,
            controls: ['zoomControl','typeSelector','searchControl']
        });
    
    
    //отримання координат по кліку
    myMap.events.add('click', (e)=>{
        console.log('Це клік по карті');
        let coords = e.get('coords');
        //отримання назви вулиці
        getAddress(coords).then((address)=>{
            console.log('address',address);
            //відкривання модального вікна
            showWindow(address,coords).then(()=>{
                console.log('OK');
                //додавання мітки
                let point = createPlacemark(coords);
                clusterer.add(point);
                console.log('мітка добавлена');
            },()=>{
                console.log('False');
            });
        });
    });
    
    /*створення кластера*/
    var clusterer = new ymaps.Clusterer({
        preset: 'islands#redClusterIcons',
        groupByCoordinates: false,
    });
    
    /* Клік по кластеру */
    clusterer.events.add('click', (e)=>{
        let type = e.get('target').options._name;
        
        if(type === 'cluster'){
            //клік по кластеру
            console.log('Це клік по кластеру');
            let arr = clusterer.getGeoObjects();
            for (let i=0; i < arr.length; i++){
                let coordinates = arr[i].geometry._coordinates;
                console.log(coordinates);
            }
        }
        
        if(type === 'geoObject'){
            //клік по мітці
            console.log('Це клік по мітці');
            let coordinates = e.get('target').geometry._coordinates;
            console.log('coordinates',coordinates);
            showListComents(coordinates);
        }
    });
     
    ///добавлення кластера на карту
    myMap.geoObjects.add(clusterer);
    
}//innit







//створення мітки 
function createPlacemark(coords){
        return new ymaps.Placemark(coords,{});
    }


function showWindow(address,coords){
    return new Promise((resolve,reject)=>{
        let window = document.querySelector('.window');
        let content_1 = document.querySelector('.content_1');
        let content_2 = document.querySelector('.content_2');
        window.classList.remove('hide');
        content_2.classList.add('hide');
        content_1.classList.remove('hide');
        let counter = 0; //счетчик для кнопки добавити
    
        //встановлення в поля адрес
        let address_span = document.querySelector('.address');
        let place = document.getElementById('place');
        address_span.textContent = address;
        place.value = address;
        
        //функціонал кнопки добавити
        add_btn.addEventListener('click',(e)=>{
            console.log('click');
//            counter++;
//            let name = document.getElementById('name');
//            let coment = document.getElementById('coment');
//            let data = getTimeNow();
//            if(!name.value && !coment.value && !place.value){
//                alert('Заповніть усі поля');
//            }else{
//                let li = createLi(name.value,place.value,data,coment.value);
//                let list = document.querySelector('.list');
//                list.appendChild(li);
//                //запис властивостей в обєкт
//                console.log('coords', coords);
//                let obj = createObj(coords,name.value,place.value,data,coment.value);
//                all_placemarks.push(obj);
////                name.value = '';
////                coment.value = '';
//                    counter++;
//            }
        });
        
        close_btn.addEventListener('click',e=>{
            window.classList.add('hide');
            //перевірка чи був добавлений якийсь коментар
            if(counter > 0){
                return resolve();
            }else{
                return reject();
            }
            
        })
    });
    
}

function showListComents(coordinates){
        let window = document.querySelector('.window');
        let content_1 = document.querySelector('.content_1');
        let content_2 = document.querySelector('.content_2');
        window.classList.remove('hide');
        content_1.classList.add('hide');
        content_2.classList.remove('hide');
    
    
        //встановлення в поля адрес
        let address_span = document.querySelector('.address');
        
        
        let list = document.querySelector('.content_2').querySelector('.list');
        list.innerHTML = ' ';
        console.log(list.innerHTML);
        //////////////////////////////////////////// брати інформацію з обєкта і рендирити у вікно
        console.log('POINT coordinates',coordinates);
        for(let array_all of all_placemarks){
            console.log('coordinates ', coordinates,' ==== ',array_all.coords);
            console.log('OBJECT ',array_all);
            if(checkArrays(coordinates,array_all.coords)){
                let element = createLi(array_all.name,array_all.place,array_all.data,array_all.coment);
                  address_span.textContent = array_all.place;
                list.appendChild(element);
             }
            }
}

function getAddress(coords){
    return new Promise((resolve)=>{
         ymaps.geocode(coords).then((answer)=>{
            return resolve(answer.geoObjects.get(0).getAddressLine());
         });
    });
}

function createLi(name,place,data,text){
    let li = document.createElement('li');
    li.classList.add('list-item');
    
    let info = document.createElement('div');
    info.classList.add('info');
    
    let span_name = document.createElement('span');
    span_name.classList.add('name');
    span_name.textContent = name+'  ';
    
    let span_place = document.createElement('span');
    span_place.classList.add('place');
    span_place.textContent = place +'  ';
    
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

function createObj(coords,name,place,data,coment){
    let obj = {};
    obj.coords = coords;
    obj.name = name;
    obj.place = place;
    obj.data = data;
    obj.coment = coment;
    console.log(obj);
    return obj;
}

function checkArrays(array_check,array){
    if(array_check[0] === array[0] && array_check[1] === array[1]){
        console.log(array_check[0],' === ',array[0]);
        console.log(array_check[1],' === ',array[1]);
        console.log('return TRUE');
       return true;
    }else{
        console.log(array_check[0],' === ',array[0]);
        console.log(array_check[1],' === ',array[1]);
        console.log('return False');
        return false;
    }
}

