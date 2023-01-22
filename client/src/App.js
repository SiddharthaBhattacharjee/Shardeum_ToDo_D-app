import React, {useState, useEffect} from 'react';
import {TextField, Button} from "@mui/material";
import Task from './Task';
import './App.css';

import { TaskContractAddress } from './config.js';
import {ethers} from 'ethers';
import TaskAbi from './utils/TaskContract.json';

function App(){
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState('');
  const [currentAccount, setCurrentAccount] = useState('');
  const [correctNetwork, setCorrectNetwork] = useState(false);
  //useState is used to store the data in the state of the component and re-render the component when the state changes

  const connectWallet = async () => {
    try{
      const {ethereum} = window;
      if(!ethereum){
        alert('Metamask Not Found ! Get MetaMask and Try Again.');
        return;
      }

      let chainId = await ethereum.request({method: 'eth_chainId'});

      const shardeumChainId = '0x1f91';
      console.log(chainId);
      if(chainId !== shardeumChainId){
        alert('Please Connect to Shardeum Testnet');
        return;
      }
      else{
        setCorrectNetwork(true);
      }

      const accounts = await ethereum.request({method: 'eth_requestAccounts'});
      setCurrentAccount(accounts[0]);
      console.log('Connected', accounts[0]);
    } catch(error){
      console.log(error);
    }
  }

  const getAllTasks = async () => {
    try{
      const {ethereum} = window;
      if(ethereum){
        //setting up provider
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        console.log('signer : ',signer);
        const TaskContract = new ethers.Contract(TaskContractAddress, TaskAbi.abi, signer);
        console.log('TaskContract : ',TaskContract);
        //calling the smart contract
        let allTasks = await TaskContract.getMyTasks();
        console.log('allTasks : ',allTasks);
        setTasks(allTasks);
      }
      else{
        console.log('Ethereum object not found');
      }
    }catch(error){
      console.log(error);
    }
  }


  const addTask = async () => {
    let task = {
      'taskText': input,
      'isDeleted': false,
    };

    try{
      //setting up provider
      const {ethereum} = window;
      if(ethereum){
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();//signer is the user's wallet
        const TaskContract = new ethers.Contract(TaskContractAddress, TaskAbi.abi, signer);//this step is to connect to the smart contract
        //calling the smart contract
        TaskContract.addTask(task.taskText, task.isDeleted)
        .then(response => {
          setTasks([...tasks, task]);
        })
        .catch(err => {
          console.log(err);
        });
      }
      else{
        console.log('Ethereum object not found');
      }
    }catch(error){
      console.log(error);
    }

    setInput('');
  }

  const deleteTask = key => async () => {

    try{
      //setting up provider
      const {ethereum} = window;
      if(ethereum){
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const TaskContract = new ethers.Contract(TaskContractAddress, TaskAbi.abi, signer);
        //calling the smart contract to delete the task
        let deleteTx = await TaskContract.deleteTask(key, true);
        let allTasks = [];
        for(let i in tasks){
          if(tasks[i].id !== key){
            allTasks.push(tasks[i]);
          }
        }
        setTasks(allTasks);
      }
      else{
        console.log('Ethereum object not found');
      }
    }catch(error){
      console.log(error);
    }

    setInput('');
  }

  useEffect(()=>{
    connectWallet();
    getAllTasks();
  }, []);
  // useEffect is used to call the function only once when the page loads

  return (
    <div>
      {currentAccount === '' ? (
        <button
        className='text-2xl font-bold py-3 px-12 bg-[#f1c232] rounded-lg mb-10 hover:scale-105 transition duration-500 ease-in-out'
        onClick={connectWallet}
        >
        Connect Wallet
        </button>
        ) : correctNetwork ? (
          <div className="App">
            <h2> Task Management App</h2>
            <form>
              <TextField id="outlined-basic" label="Make Todo" variant="outlined" style={{margin:"0px 5px"}} size="small" value={input}
              onChange={e=>setInput(e.target.value)} />
              <Button variant="contained" color="primary" onClick={addTask}  >Add Task</Button>
            </form>
            <ul>
                {tasks.map(item=> 
                  <Task 
                    key={item.id}
                    taskText={item.taskText}
                    onClick={deleteTask(item.id)}
                  />)
                }
            </ul>
          </div>
        ) : (
        <div className='flex flex-col justify-center items-center mb-20 font-bold text-2xl gap-y-3'>
        <div>-----------------------------------------</div>
        <div>Please connect to the Shardeum Testnet</div>
        <div>and reload the page</div>
        <div>-----------------------------------------</div>
        </div>
      )}
  </div>
  )
}

export default App;