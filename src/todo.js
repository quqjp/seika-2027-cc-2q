import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './firebase.js';
import {
  addDoc,
  collection,
  deleteDoc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import './style.css';

const itemsCollection = collection(db, 'items');

let unsubscribe = null;

function setFilter(filterType) {
  let q = null;
  if (filterType == 'all') {
    q = query(
      itemsCollection,
      where('userid', '==', auth.currentUser.uid),
      orderBy('timestamp')
    );
  } else if (filterType == 'incomplete') {
    q = query(
      itemsCollection,
      where('userid', '==', auth.currentUser.uid),
      where('checked', '==', false),
      orderBy('timestamp')
    );
  } else if (filterType == 'complete') {
    q = query(
      itemsCollection,
      where('userid', '==', auth.currentUser.uid),
      where('checked', '==', true),
      orderBy('timestamp')
    );
  }

  if (unsubscribe != null) {
    unsubscribe();
  }

  unsubscribe = onSnapshot(q, (querySnapshot) => {
    const itemGroupDiv = document.querySelector('#item-group');
    while (itemGroupDiv.childElementCount > 0) {
      itemGroupDiv.firstElementChild.remove();
    }

    for (const docSnapshot of querySnapshot.docs) {
      const data = docSnapshot.data();
      const docRef = docSnapshot.ref;

      const itemDiv = document.createElement('div');
      itemDiv.classList.add('item');

      const checkboxInput = document.createElement('input');
      checkboxInput.type = 'checkbox';
      checkboxInput.checked = data.checked;
      checkboxInput.onchange = async () => {
        await updateDoc(docRef, {
          checked: checkboxInput.checked,
        });
      };

      const textInput = document.createElement('input');
      textInput.value = data.text;
      textInput.onchange = async () => {
        await updateDoc(docRef, {
          text: textInput.value,
        });
      };

      const closeButton = document.createElement('button');
      closeButton.textContent = 'x';
      closeButton.onclick = async () => {
        await deleteDoc(docRef);
      };

      itemDiv.appendChild(checkboxInput);
      itemDiv.appendChild(textInput);
      itemDiv.appendChild(closeButton);

      itemGroupDiv.appendChild(itemDiv);
    }
  });
}

// フィルターボタン
const buttonFilterAll = document.querySelector('#filter-all');
const buttonFilterIncomplete = document.querySelector('#filter-incomplete');
const buttonFilterComplete = document.querySelector('#filter-complete');

buttonFilterAll.onclick = () => {
  buttonFilterAll.setAttribute('disabled', 'true');
  buttonFilterIncomplete.removeAttribute('disabled');
  buttonFilterComplete.removeAttribute('disabled');
  setFilter('all');
};

buttonFilterIncomplete.onclick = () => {
  buttonFilterAll.removeAttribute('disabled');
  buttonFilterIncomplete.setAttribute('disabled', 'true');
  buttonFilterComplete.removeAttribute('disabled');
  setFilter('incomplete');
};

buttonFilterComplete.onclick = () => {
  buttonFilterAll.removeAttribute('disabled');
  buttonFilterIncomplete.removeAttribute('disabled');
  buttonFilterComplete.setAttribute('disabled', 'true');
  setFilter('complete');
};

// サインアウト
const formSignOut = document.querySelector('#sign-out-form');
formSignOut.onsubmit = async (e) => {
  e.preventDefault();
  await auth.signOut();
};

// アイテム追加
const formAddItem = document.querySelector('#add-item-form');
formAddItem.onsubmit = async (e) => {
  e.preventDefault();

  const formData = new FormData(e.currentTarget);
  const text = formData.get('text');

  try {
    await addDoc(itemsCollection, {
      text,
      checked: false,
      timestamp: new Date(),
      userid: auth.currentUser.uid,
    });
    e.target.reset();
  } catch (error) {
    console.log(error);
  }
};

// 認証状態の監視
onAuthStateChanged(auth, (user) => {
  if (user != null) {
    const span = document.querySelector('#user-name');
    span.textContent = user.email;
    setFilter('all');
  } else {
    window.location.href = '/index.html';
  }
});
