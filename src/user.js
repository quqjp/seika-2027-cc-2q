import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase.js';
import './style.css';

const form = document.getElementById('form-sign-out');

form.onsubmit = (event) => {
  event.preventDefault();
  signOut(auth).catch((error) => {
    window.alert(error.message);
  });
};

onAuthStateChanged(auth, (user) => {
  if (user != null) {
    const input = form.querySelector('input[type=email]');
    input.value = user.email;
  } else {
    window.location.assign('/index.html');
  }
});
