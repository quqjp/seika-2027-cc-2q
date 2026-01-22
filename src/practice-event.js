import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
} from 'firebase/firestore';
import { db } from './firebase.js';

const messagesRef = collection(db, 'messages');
const form = document.querySelector('form');
const input = form.querySelector('input');
const messagesDiv = document.querySelector('#messages');
const q = query(messagesRef, orderBy('timestamp'));

// メッセージ送信
form.onsubmit = async (event) => {
  event.preventDefault();

  const formData = new FormData(event.currentTarget);
  const message = formData.get('message');

  await addDoc(messagesRef, {
    message,
    timestamp: new Date(),
  });
  input.value = '';
};

// リアルタイム同期
onSnapshot(q, (querySnapshot) => {
  while (messagesDiv.childElementCount > 0) {
    messagesDiv.firstElementChild.remove();
  }

  let lastMessage = null;
  for (const docSnapshot of querySnapshot.docs) {
    const data = docSnapshot.data();
    const div = document.createElement('div');
    div.classList.add('message');
    div.textContent = data.message;

    messagesDiv.appendChild(div);
    lastMessage = div;
  }

  if (lastMessage != null) {
    lastMessage.scrollIntoView({
      behavior: 'smooth',
    });
  }
});
