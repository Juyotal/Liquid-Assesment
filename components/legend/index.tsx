import { FirebaseError } from 'firebase/app';
import { auth } from '@/config/firebase'
import { User, createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { IUserScore, getUserScore } from '@/services/gameScore.service';
import { LegendRefType } from '@/app/page';

export interface IUserData {
    best_accuracy: number;
    rounds: number;
    user: string | null;
}

export const Legend = forwardRef<LegendRefType, {}> ((props, ref) => {

    useImperativeHandle(ref, () => ({
      updateLegend: async() => {
            await _updateLegend()
        }
    }));

    const [email, setEmail] = useState('')
    const [emailError, setEmailError] = useState(false)
    const [password, setPassword] = useState('')
    const [passwordError, setPasswordError] = useState(false)
    const [currentUser, setCurrentUser] = useState<User | null>(null)
    const [userData, setUserData] = useState<IUserScore | null>(null);

    const handleSubmit = async () => {
        try {
          validateInputs()
          await signInWithEmailAndPassword(auth, email, password)
        } catch (err:any) {
          if (err instanceof FirebaseError && err.code === "auth/user-not-found") {
            await createUserWithEmailAndPassword(auth, email, password)
          }
          if (err instanceof FirebaseError && err.code === "auth/invalid-email"){
            setEmailError(true)
          }
          if (err instanceof FirebaseError && err.code === "auth/wrong-password"){
            setPasswordError(true)
          }
          console.error(err.message)
        }
    }

    
    const validateInputs = () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(email) && password.length >= 6){
        return
      }
      if (!emailRegex.test(email)){
        setEmailError(true)
      }
      if (password.length < 6){
        setPasswordError(true)
      }
      throw Error('Invalid Inputs')
    }


    const logOut = async () => {
        return await signOut(auth)
    }


    const _updateLegend = async () => {
        if (!currentUser) {
            setUserData(null)
            return
        }
        try {
          let data = await getUserScore(currentUser.email)
          data = !data ? {best_accuracy: 0, rounds: 0, user: currentUser.email, id: ''} : data
          setUserData(data)
        } finally {
        }
        
    }


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async user => {
            setCurrentUser(user)
        })
        return unsubscribe
    }, [])

    
    useEffect(() => {
      setPasswordError(false)
      setEmailError(false)
    }, [email, password])


    useEffect(() => {
        const fetch = async () => {
            await _updateLegend()
        }
        fetch()
    }, [currentUser])


    const renderForm = () => {
      return (
        <>
          <div className='text-center'>
            <p className="legend-p-one">Sign Up Game Account</p>
            <p className="legend-p-two">Sign up to save and access game data.</p>
          </div>
          <div className="form-input-container">
            <div className="mb-10">
              <div className='input-container'>
                  <input
                      type="email"
                      placeholder="Email..."
                      onChange={(e) => setEmail(e.target.value)}
                      className={`input
                      ${emailError? 'invalid':''}
                      `}
                  />
              </div>
            </div>
            <div className='input-container'>
              <input
                  type="password"
                  placeholder="Password..."
                  onChange={(e) => setPassword(e.target.value)}
                  className={`input
                      ${passwordError? 'invalid':''}
                      `}
              />
            </div>
          </div>
          <div className="form-btn-container">
            <button onClick={handleSubmit} className="button primary" disabled={passwordError || emailError}>
              Sign In
            </button>
          </div>
        </>
      );
    }


    const renderLegend = (userData: IUserScore) => {
      return (
        <>
          <div className='text-center'>
            <p className="legend-p-one">UserName</p>
            <p className="legend-p-two">{userData.user?.split('@')[0]}</p>
          </div>
          <div className='text-center'>
            <p className="legend-p-one">Rounds Played</p>
            <p className="legend-p-two">{userData.rounds}</p>
          </div>
          <div className='text-center'>
            <p className="legend-p-one">Best Accuracy</p>
            <p className="legend-p-two">{userData.best_accuracy} %</p>
          </div>
          <div className="form-btn-container">
            <button onClick={logOut} className="button primary">
              LogOut
            </button>
          </div>
        </>
      );
    }


    return (
      <div className="legend-content">
        {!userData && renderForm()}
        {userData && renderLegend(userData)}
      </div>  
    )
})