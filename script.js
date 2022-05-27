'use strict';

///////////////////////////////////////
// Modal window

const header = document.querySelector('.header');
const modal = document.querySelector('.modal');
const overlay = document.querySelector('.overlay');
const btnCloseModal = document.querySelector('.btn--close-modal');
const btnsOpenModal = document.querySelectorAll('.btn--show-modal');
const btnScrollTo = document.querySelector('.btn--scroll-to');
const section1 = document.querySelector('#section--1');
const nav = document.querySelector('.nav');
const tabs = document.querySelectorAll('.operations__tab');
const tabsContainer = document.querySelector('.operations__tab-container');
const tabsContent = document.querySelectorAll('.operations__content');

const openModal = function () {
  modal.classList.remove('hidden');
  overlay.classList.remove('hidden');
};

const closeModal = function () {
  modal.classList.add('hidden');
  overlay.classList.add('hidden');
};

for (let i = 0; i < btnsOpenModal.length; i++)
  btnsOpenModal[i].addEventListener('click', openModal);

btnCloseModal.addEventListener('click', closeModal);
overlay.addEventListener('click', closeModal);

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
    closeModal();
  }
});
/////Button scrolling
btnScrollTo.addEventListener('click', function (e) {
  //e.preventDefault();

  //x is the distance from the edge of the element to the left side of the viewport, y is from the edge of the element to the top of the viewport. y and top are not always the same because when we scroll, we change the position of x and y. this BoundingClientRect is basically relative to this visible view port
  const s1coords = section1.getBoundingClientRect();
  console.log(e.target.getBoundingClientRect());
  //DOMRect {x: 143.5, y: 351.390625, width: 112.4609375, height: 28.5, top: 351.390625, …}(BEFORE SCROLLING)

  //We ca also get the current scrolling position
  //We get 0 from X means that there is no horizontal scroll, 50.5 from y means that the distance between the top of the current viewport to the top of the page is 50.5. When we at the very top of the page then both values should be 0
  console.log('Current scroll: X/Y', window.pageXOffset, window.pageYOffset);
  //Current scroll: X/Y 0 50.5

  //We can also get the height and the width of the viewport
  console.log(
    'height/width of viewport',
    document.documentElement.clientHeight,
    document.documentElement.clientWidth
  );
  // window.scrollTo({
  //   left: s1coords.left,
  //   top: s1coords.top + window.pageYOffset,
  //   behavior: 'smooth',
  // });
  section1.scrollIntoView({ behavior: 'smooth' });
});

/////Page navigation
// document.querySelectorAll('.nav__link').forEach(function (el) {
//   el.addEventListener('click', function (e) {
//     e.preventDefault();

//     const id = this.getAttribute('href');
//     document.querySelector(id).scrollIntoView({
//       behavior: 'smooth',
//     });
//   });
// });

//1.Add even listenert to common parent element
//2.Determine what element originated the event

document.querySelector('.nav__links').addEventListener('click', function (e) {
  e.preventDefault();

  //Matching strategy
  if (e.target.classList.contains('nav__link')) {
    const id = e.target.getAttribute('href');
    document.querySelector(id).scrollIntoView({
      behavior: 'smooth',
    });
  }
});

//Tabbed component

tabsContainer.addEventListener('click', function (e) {
  const clicked = e.target.closest('.operations__tab');

  //Guard clause
  if (!clicked) return;

  //Remove active classes
  tabs.forEach(tab => tab.classList.remove('operations__tab--active'));
  tabsContent.forEach(tab =>
    tab.classList.remove('operations__content--active')
  );

  //Activate tab
  clicked.classList.add('operations__tab--active');

  //Activate content area
  document
    .querySelector(`.operations__content--${clicked.dataset.tab}`)
    .classList.add('operations__content--active');
});

//Menu fade animation
const handleHover = function (e, opacity) {
  //We don't use closest because there's no child elements that we could accidentally click here
  if (e.target.classList.contains('nav__link')) {
    const link = e.target;
    const siblings = link.closest('.nav').querySelectorAll('.nav__link');
    const logo = link.closest('.nav').querySelector('img');

    siblings.forEach(el => {
      if (el !== link) el.style.opacity = opacity;
    });
    logo.style.opacity = opacity;
  }
};

nav.addEventListener('mouseover', function (e) {
  handleHover(e, 0.5);
});

nav.addEventListener('mouseout', function (e) {
  handleHover(e, 1);
});

//Sticky navigation
// const initialCoords = section1.getBoundingClientRect();
// console.log(initialCoords);
// window.addEventListener('scroll', function (e) {
//   // //The distance between the top of the current viewport to the top of the page
//   // console.log(this.window.scrollY);
//   // console.log(initialCoords);

//   if (section1.getBoundingClientRect().top < 0) {
//     nav.classList.add('sticky');
//   } else nav.classList.remove('sticky');
// });

//Sticky navigation: Intersection Observer API
const navHeight = nav.getBoundingClientRect().height;
const obsOptions = {
  //root: the element that the target(section1) is intersecting. null means you will be able to observe our target element intersecting the entire viewport
  root: null,
  //thresold: the percentage of intersection at which the observer callback will be called. Can also have multiple threshold. Basically threshold means the target element(section1) is 10% visible in the viewport
  //0 means the callback will trigger each time that the target element moves completely out of the view and also as soon as it enters the view
  threshold: [0, 0.2], //10%
  rootMargin: `-${navHeight}px`,
};

//The callbackfunction will get called each time that the observed element (header) is intersecting the root element at the threshold we defined
//This function is called with 2 arguments: the entries and the observer object itself
const obsCallback = function (entries, observer) {
  entries.forEach(entry => {
    // console.log(entry);
    if (entry.isIntersecting === false) nav.classList.add('sticky');
    else nav.classList.remove('sticky');
  });
};

const observer = new IntersectionObserver(obsCallback, obsOptions);
observer.observe(header);

//Reveal sections
const allSections = document.querySelectorAll('.section');
const revealSection = function (entries, observer) {
  //for each threshold, there will be an entry in the array(entry is always stored in array even if it's just 1)
  const [entry] = entries;
  //console.log(entry);
  if (!entry.isIntersecting) return;

  entry.target.classList.remove('section--hidden');
  observer.unobserve(entry.target);
};

const sectionObserver = new IntersectionObserver(revealSection, {
  root: null,
  threshold: 0.1,
});

allSections.forEach(sec => {
  sectionObserver.observe(sec);
  //sec.classList.add('section--hidden');
});

//Lazy image
//Select all the images which have the property of [data-src]
const images = document.querySelectorAll('img[data-src]');

const observe = function (entries, observer) {
  const entry = entries[0];
  // console.log(entry);
  console.log(entries);
  if (!entry.isIntersecting) return;

  //Shouldn't use .classList.remove because it happend almost right away, so we can't see the blurry effect

  //Replace src with data-src
  entry.target.src = entry.target.dataset.src;
  //Add .classList.remove after the image has done loading
  entry.target.addEventListener('load', function () {
    entry.target.classList.remove('lazy-img');
  });
  observer.unobserve(entry.target);
};

const imagesObserve = new IntersectionObserver(observe, {
  root: null,
  threshold: 0.1,
});

images.forEach(img => {
  imagesObserve.observe(img);
});

//Slider
const slides = document.querySelectorAll('.slide');

const btnLeft = document.querySelector('.slider__btn--left');
const btnRight = document.querySelector('.slider__btn--right');
const dotContainer = document.querySelector('.dots');

let curSlide = 0;
const maxSlide = slides.length - 1;
const slider = document.querySelector('.slider');
slider.style.transform = 'scale(0.8)';
slider.style.overflow = 'hidden';

const createDots = function () {
  slides.forEach(function (_, i) {
    dotContainer.insertAdjacentHTML(
      'beforeend',
      `<button class="dots__dot" data-slide="${i}"></button>`
    );
  });
};
createDots();

const activateDots = function (slide) {
  const dot = document.querySelectorAll('.dots__dot');
  dot.forEach(dot => dot.classList.remove('dots__dot--active'));
  dot[slide].classList.add('dots__dot--active');
  // document
  //   .querySelector(`.dots__dot[data-slide="${slide}"]`)
  //   .classList.add('dots__dot--active');
};

//Going next slide
const goToSlide = function (slide) {
  slides.forEach(
    (s, i) =>
      //first iteration: i =0, curSlice = 1 => translateX = -100%
      (s.style.transform = `translateX(${100 * (i - slide)}%)`)
  );
};
goToSlide(0);

const nextSlide = function () {
  if (curSlide === maxSlide) curSlide = 0;
  else curSlide++;

  goToSlide(curSlide);
  activateDots(curSlide);
};

const prevSlide = function () {
  if (curSlide === 0) curSlide = maxSlide;
  else curSlide--;

  goToSlide(curSlide);
  activateDots(curSlide);
};

//Event handler
btnRight.addEventListener('click', nextSlide);
btnLeft.addEventListener('click', prevSlide);

document.addEventListener('keydown', function (e) {
  if (e.key === 'ArrowLeft') prevSlide();
  if (e.key === 'ArrowRight') nextSlide();
});

dotContainer.addEventListener('click', function (e) {
  if (e.target.classList.contains('dots__dot')) {
    const slide = +e.target.dataset.slide;
    goToSlide(slide);
    activateDots(slide);
  }
});
//Set them as each hundred percent because the width of each element is 100% => the second one will start right after the first one
//0%, 100%, 200%, 300%

////// SELECTING ELEMENTS //////////////
// console.log(document.documentElement);
// console.log(document.head);
// console.log(document.body);

// const header = document.querySelector('.header');
// const allSections = document.querySelectorAll('.section');
// console.log(allSections);

// //Get the element with the id #section--1
// document.getElementById('section--1');

// //Get all the elements with the name of button. This method returns an HTML collection, not NodeList. Means that if the DOM changes then the collecetion is also automatically update (for example if we delete the button, the collection will be updated and we can't read this button anymore). The same does not happen with the NodeList
// const allButtons = document.getElementsByTagName('button');
// console.log(allButtons);

// //Same with getElementById, sldo return a life HTML collections
// document.getElementsByClassName('btn');

// ////// CREATING AND INSERTING ELEMENTS  ////////
// // .insertAdjacentHTML

// //We need to pass in this method the tag name, then it'll return a DOM element that we can save somewhere
// const message = document.createElement('div');
// message.classList.add('cookie-message');
// //message.textContent = 'We use cookie to improve Spotago';
// message.innerHTML =
//   'We use cookied for improved Spotago. <button class="btn btn--close-cookie">Got it!</button>';

// //prepend basically adds the element as the first child of this element. We can also add it as last child using append. The mesasge here will only appear once because it can only exist at one place at the time
// header.prepend(message);
// //header.prepend(message)

// //If you want to insert multiple copies of the same element, first we need to copy the element. Instead of appending the message directly, we first clone it, then we need to pass in true which simply means that all the child elements will also be copied
// //header.append(message.cloneNode(true));

// //As the name said, it'll insert the message before or after the header element
// //header.before(message);
// //header.after(message)

// ///// DELETE ELEMENTS /////
// // document
// //   .querySelector('.btn--close-cookie')
// //   .addEventListener('click', function () {
// //     message.remove();
// //   });

// ////STYLES ////////
// //To sset style on an element, select the element, then add style, then the property name
// message.style.backgroundColor = '#444444';
// message.style.width = '120%';

// //The above method only show th ein-line style of the element. When you select it like
// console.log(message.style.backgroundColor);
// //it will show up. But if the style is in the CSS file
// console.log(message.style.height);
// //then it won't show up. To select the real style of the element, use
// getComputedStyle(message).color; //=> it will show up all the styles in the css file, even when the property is not defined in the css file

// ////// CSS custom porperty or CSS variable
// //You can change the css properties directly here with JS
// document.documentElement.style.setProperty('--color-primary', 'grey');

// // ATTRIBUTES
// const logo = document.querySelector('.nav__logo');

// //This only work for standard element property. If you do like logo.designer then it will return undefined
// console.log(logo.alt);
// console.log(logo.src);
// console.log(logo.className);

// //Beside reading the value, you can also set them a new value
// // logo.alt = 'Beautiful'

// //Non-standard. To actually get logo.designer, you should use the getAttribute function
// console.log(logo.getAttribute('designer'));
// //Oppesite with getAttribute is the setAttribute function
// //logo.setAttribute('company', 'Tier9')

// /////  EVENT PORPAGATION ///////
// //  rgb(255,255,255)
// const randomInt = (min, max) =>
//   Math.floor(Math.random() * (max - min + 1) + min);
// const randomColor = () =>
//   `rgb(${randomInt(0, 255)},${randomInt(0, 255)},${randomInt(0, 255)})`;
// console.log(randomColor());

// document.querySelector('.nav__link').addEventListener('click', function (e) {
//   this.style.backgroundColor = randomColor();

//   //Stop propagation
//   //e.stopPropagation();
// });

// document.querySelector('.nav__links').addEventListener('click', function (e) {
//   this.style.backgroundColor = randomColor();
// });

// document.querySelector('.nav').addEventListener('click', function (e) {
//   this.style.backgroundColor = randomColor();
// });

const h1 = document.querySelector('h1');

// //Going downward: child
// console.log(h1.querySelectorAll('.highlight'));
// //Direct children
// console.log(h1.childNodes);
// //Direct child element
// console.log(h1.children);
// //First and last element child
// console.log(h1.firstElementChild);
// h1.firstElementChild.style.color = 'white'; //Live HTML collection

// //Going upward: parent
// //Direct parent node
// console.log(h1.parentNode);
// //Direct parent element
// console.log(h1.parentElement);
// //Find parent no matter how far it is
// //Select the closest header to the h1 element
// h1.closest('.header').style.backgroundColor = 'lightblue';

// //Going sidways: sibling
// //Previous and next element sibling
// console.log(h1.previousElementSibling);
// console.log(h1.nextElementSibling);
// //Previous and next node sibling
// console.log(h1.previousSibling);
// console.log(h1.nextSibling);
// //Select all siblings
// console.log(h1.parentElement.children);
// [...h1.parentElement.children].forEach(function (el) {
//   el.style.backgroundColor = 'yellow';
// });

//This event doesnt wait for images and other external resources to be loaded. It just loads HMTl and JS.This event is fired by the document as soon as the HTML is completely parsed, which means that the HTML has been downloaded and been converted to the DOM tree.
document.addEventListener('DOMContentLoaded', function (e) {});

//The load event is fired by the window. As soon as the HTML/ CSS/ images/external resources is fired. Basically when the complete page has finish loading is when this event get fired
window.addEventListener('load', function (e) {
  console.log('Page fully loaded', e);
});

//This event fired right about user about to leave the page(ex: click the close button)
// window.addEventListener('beforeunload', function (e) {
//   e.preventDefault();
//   console.log(e);
//   e.returnValue = '';
// });
