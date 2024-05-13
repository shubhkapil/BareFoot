const showPos = (position) = () => {
    console.log(position)
}
const getLocation = () => {
    navigator.geolocation.getCurrentPosition(showPos);
}

getLocation()




const options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
  };
  
  function success(pos) {
    const crd = pos.coords;
    window.alert(`Current location, Latitude: ${crd.latitude}, Longitude : ${crd.longitude}`);
    
  }
  
  function error(err) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
  }
  
  navigator.geolocation.getCurrentPosition(success, error, options);

  exports.getAllTouristDestinations = (req, res) => {
    res.send(cName);
  };

  getAllTouristDestinations(cName);

const cName = document.getElementById('cityname');

const lat = crd.latitude;
const long = crd.longitude;

const b1 = document.querySelector('#btn-1');
const b2 = document.querySelector('#btn-2');

b1.addEventListener('click', (evt)=> {
    evt.preventDefault();
    const cName = document.querySelector('#cityname').value;
    const destpage = `http://localhost:3000/api/${cName}`
    window.open(destpage);
})

b2.addEventListener('click', (evt)=> {
  evt.preventDefault();
  const cName = document.querySelector('#cityname').value;
  const time = document.querySelector('#t').value;
  
  // window.alert($(crd.longitude));
  const route = `http://localhost:3000/api/${cName}/${time}/77.58/12.98`;
  console.log(route);
  window.open(route);
})

// const form = document.querySelector('form');

// form.addEventListener('on')