import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { auth } from './firebase.js';
import './style.css';

// DOM要素の取得
const divSignIn = document.getElementById('sign-in');
const divSignUp = document.getElementById('sign-up');
const buttonToggleSignIn = document.getElementById('toggle-sign-in');
const buttonToggleSignUp = document.getElementById('toggle-sign-up');
const formSignIn = document.getElementById('form-sign-in');
const formSignUp = document.getElementById('form-sign-up');

// サインイン/サインアップ表示切り替え
buttonToggleSignIn.onclick = () => {
  divSignIn.classList.remove('hidden');
  divSignUp.classList.add('hidden');
};

buttonToggleSignUp.onclick = () => {
  divSignIn.classList.add('hidden');
  divSignUp.classList.remove('hidden');
};

// サインイン処理
formSignIn.onsubmit = (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  const email = formData.get('email');
  const password = formData.get('password');

  signInWithEmailAndPassword(auth, email, password).catch((error) => {
    window.alert(error.message);
  });
};

// サインアップ処理
formSignUp.onsubmit = (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  const email = formData.get('email');
  const password = formData.get('password');

  createUserWithEmailAndPassword(auth, email, password).catch((error) => {
    window.alert(error.message);
  });
};

// 認証状態の監視
onAuthStateChanged(auth, (user) => {
  if (user != null) {
    window.location.assign('/todo.html');
  }
});
