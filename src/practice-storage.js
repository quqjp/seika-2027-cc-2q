import {
  deleteObject,
  getDownloadURL,
  getMetadata,
  list,
  ref,
  uploadBytes,
} from 'firebase/storage';
import { auth, storage } from './firebase.js';
import { onAuthStateChanged } from 'firebase/auth';

// TODO-1: ログイン判定
let uid = '';

onAuthStateChanged(auth, (user) => {
  console.log('user', user);
  // ユーザがログインしているかどうか確認
  if (user != null) {
    // -> してる
    //   - ページにとどまる -> TODO-2 へ
    uid = user.uid;
    // ファイルリストを取得
    getFileList();
  } else {
    // -> してない
    //   - ログイン画面に移動させる
    window.location.assign('/index.html');
  }
});

// TODO-2: アプリケーションをログインユーザごとに機能するように調整
// - ユーザIDを取り出す
// - ＜ファイルの表示＞部分の調整
//   - ファイルパスを調整する
// - ＜ファイルの登録＞部分の調整
//   - ファイルパスを調整する
// - ＜ファイルリスト取得＞部分の調整
//   - ファイルパスを調整する
// - ＜ファイル削除＞部分の調整
//   - ファイルパスを調整する
// - getFileList()を呼び出すタイミングを考える

//
// 1. ファイルの表示
//
const form = document.querySelector('#show-file');
form.onsubmit = async (event) => {
  event.preventDefault();

  // フォームから入力された文字を取得する
  const formData = new FormData(event.target);
  const path = formData.get('path');

  previewFile(path);
};

// ファイルの表示
async function previewFile(path) {
  try {
    // ファイルの参照
    const fileRef = ref(storage, 'my-files/' + uid + '/' + path);

    // ファイルのURLを取得する
    const fileUrl = await getDownloadURL(fileRef);
    console.log(fileUrl);

    // ファイルのメタ情報を取得する
    const fileMeta = await getMetadata(fileRef);
    console.log(fileMeta);

    const viewerEl = document.querySelector('#viewer');
    viewerEl.innerHTML = '';

    // 画像ファイルの場合
    if (fileMeta.contentType.match('image/.*')) {
      const imgEl = document.createElement('img');
      imgEl.src = fileUrl;
      viewerEl.appendChild(imgEl);

      // mp3 ファイルの場合
    } else if (fileMeta.contentType.match('audio/.*')) {
      const audioEl = document.createElement('audio');
      audioEl.src = fileUrl;
      audioEl.controls = 'controls';
      viewerEl.appendChild(audioEl);
    } else {
      // その他: ダウンロードリンク
      const aEl = document.createElement('a');
      aEl.textContent = 'ダウンロード';
      aEl.href = fileUrl;
      viewerEl.appendChild(aEl);
    }
  } catch (error) {
    console.log(error);
    alert('ファイルがありません。');
  }
}

//
// 2. ファイルの登録
//
const form2 = document.querySelector('#regist-file');
form2.onsubmit = async (event) => {
  event.preventDefault();
  try {
    const formData = new FormData(event.target);
    const file = formData.get('file');

    // ファイルの保存先となる参照を作成
    const path = 'my-files/' + uid + '/' + file.name;
    const storageRef = ref(storage, path);

    console.log(file);

    // 画像ファイル以外はアップロード不可
    if (file.type.match('image/.*')) {
      if (file.size < 5 * 1024 * 1024) {
        // ファイルをアップロードする
        await uploadBytes(storageRef, file);
        // リストを更新する
        getFileList();
        event.target.reset();
      } else {
        alert('5MB以下のファイルを指定してください');
      }
    } else {
      alert('画像ファイルを指定してください。');
    }
  } catch (error) {
    console.log(error);
    alert('ファイルの登録に失敗しました。');
  }
};

//
// 3. ファイルリスト取得
//
async function getFileList() {
  // ファイルリストを取得したいディレクトリの参照を作成
  const directoryRef = ref(storage, 'my-files/' + uid);
  const listResult = await list(directoryRef);

  const fileListEl = document.querySelector('#file-list ul');
  fileListEl.innerHTML = '';

  listResult.items.forEach((item) => {
    console.log(item);
    console.log(item.name);

    // li タグを作る
    const liEl = document.createElement('li');

    // ファイル名のボタンをつくる
    const buttonEl = document.createElement('button');
    buttonEl.onclick = () => {
      previewFile(item.name);
    };
    buttonEl.textContent = item.name;
    liEl.appendChild(buttonEl);

    // 削除ボタンをつくる
    const deleteButtonEl = document.createElement('button');
    deleteButtonEl.onclick = async () => {
      deleteFile(item);
    };
    deleteButtonEl.textContent = '削除';
    liEl.appendChild(deleteButtonEl);

    fileListEl.appendChild(liEl);
  });
}

// ファイルを削除する
async function deleteFile(ref) {
  try {
    await deleteObject(ref);
    getFileList();
  } catch (error) {
    console.log(error);
    alert('削除できませんでした。');
  }
}
