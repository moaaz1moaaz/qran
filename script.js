const compassImg = document.getElementById("compass-img");
const qiblaAngleText = document.getElementById("qibla-angle");
const prayerContainer = document.getElementById('prayer-times');

let qiblaDirection = null;

function calculateQibla(lat, lon) {
  const kaabaLat = 21.4225;
  const kaabaLon = 39.8262;
  const toRad = (deg) => deg * Math.PI / 180;
  const toDeg = (rad) => rad * 180 / Math.PI;
  const dLon = toRad(kaabaLon - lon);
  const lat1 = toRad(lat);
  const lat2 = toRad(kaabaLat);
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  let angle = toDeg(Math.atan2(y, x));
  return (angle + 360) % 360;
}

// اتّجاه القبلة
navigator.geolocation.getCurrentPosition(position => {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;

  // حساب اتجاه القبلة
  qiblaDirection = calculateQibla(lat, lon);
  if (qiblaAngleText) qiblaAngleText.textContent = `زاوية القبلة: ${qiblaDirection.toFixed(2)}°`;

  // تشغيل مستشعر الاتجاه
  if (window.DeviceOrientationEvent) {
    window.addEventListener("deviceorientationabsolute", handleOrientation, true);
    window.addEventListener("deviceorientation", handleOrientation, true);
  }

  // تحميل مواعيد الصلاة حسب الإحداثيات
  if (prayerContainer) {
    fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=4`)
      .then(res => res.json())
      .then(data => {
        const timings = data.data.timings;
        prayerContainer.innerHTML = '';
        for (const [name, time] of Object.entries(timings)) {
          const li = document.createElement('li');
          li.textContent = `${name} : ${time}`;
          prayerContainer.appendChild(li);
        }
      });
  }
}, () => {
  if (qiblaAngleText) qiblaAngleText.textContent = "تعذر تحديد موقعك.";
  if (prayerContainer) prayerContainer.innerHTML = "<li>تعذر تحديد موقعك لعرض مواعيد الصلاة.</li>";
});

// تدوير البوصلة
function handleOrientation(event) {
  if (!qiblaDirection || !compassImg) return;
  const heading = event.alpha || 0;
  const rotation = qiblaDirection - heading;
  compassImg.style.transform = `rotate(${rotation}deg)`;
}