// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import ignore from "ignore";
import { error } from "console";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBC8bYWxu0RAVhKsnV7ZQmujqP8clKno5E",
  authDomain: "neurohub-60289.firebaseapp.com",
  projectId: "neurohub-60289",
  storageBucket: "neurohub-60289.firebasestorage.app",
  messagingSenderId: "302140556758",
  appId: "1:302140556758:web:7cf2eac440ed2bb5539077",
  measurementId: "G-N7RS4792BF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const storage = getStorage(app);



export async function uploadFile(file:File , setProgress? : (progress : number) => void) {
    return new Promise((resolve,reject)=>{
        try{
            const storageRef = ref(storage,file.name)
            const uploadTask = uploadBytesResumable(storageRef,file)

            uploadTask.on('state_changed',snapshot =>{
                const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
                if(setProgress) setProgress(progress)
                switch(snapshot.state){
                    case 'paused':
                        console.log('upload is paused');break;
                    case 'running':
                        console.log('upload is running');break;
                    }
            }, error =>{
                reject(error)
            } , () => {
                getDownloadURL(uploadTask.snapshot.ref).then(downloadUrl => {
                    resolve(downloadUrl)
                })
            }
        )

        }catch (error){
            console.log(error)
            reject(error)
        }
    })
}