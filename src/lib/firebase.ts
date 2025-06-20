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
    apiKey: "AIzaSyCSJ1n_D3yzyQ-CGRhpNAaLtqK-kI5uehk",
    authDomain: "neurohub-ea661.firebaseapp.com",
    projectId: "neurohub-ea661",
    storageBucket: "neurohub-ea661.firebasestorage.app",
    messagingSenderId: "117726192412",
    appId: "1:117726192412:web:488052e4ecb69c825b50d9",
    measurementId: "G-9SKYLEEF2G"
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