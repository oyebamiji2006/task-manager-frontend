// Service Worker for TaskFlow AI PWA
//const CACHE_NAME = 'taskflow-v1'
//const urlsToCache = [
//  '/',
  //'/index.html',
  //'/manifest.json',
  //'/favicon.ico'
//]

// Install
//self.addEventListener('install', (event) => {
 // event.waitUntil(
   // caches.open(CACHE_NAME)
   //   .then((cache) => {
     //   console.log('✅ Cache opened')
     //   return cache.addAll(urlsToCache)
    //  })
 // )
//})

// Activate
//self.addEventListener('activate', (event) => {
  //event.waitUntil(
    //caches.keys().then((cacheNames) => {
      //return Promise.all(
        //cacheNames.map((cacheName) => {
          //if (cacheName !== CACHE_NAME) {
            //console.log('🗑️ Removing old cache:', cacheName)
            //return caches.delete(cacheName)
          //}
       // })
     // )
   // })
 // )
//})

// Fetch
//self.addEventListener('fetch', (event) => {
  //event.respondWith(
    //caches.match(event.request)
      //.then((response) => {
        //if (response) {
          //return response
       // }
       // return fetch(event.request)
//      })
  //)
//})