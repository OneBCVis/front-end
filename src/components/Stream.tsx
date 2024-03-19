import React, { useEffect, useState } from "react";
import Service from "../services/Service";
import Transaction from "./Transaction";
import BlockCarousel from "./BlockCarousel";
import Card from "./Card";
import TransactionPool from "./TransactionPool";

interface StreamProps {
    setTransactionData: (txnData: any) => void;
    setBlockData: (blockData: any) => void;
}

interface StreamData {
     transactions: TransactionData;
     blocks: BlockData;
}

interface TransactionData {
    txn_hash: string;
    status: string;
    amount: number;
    type: number;
    fee: number;
}

interface BlockData {
    block_hash: string;
    previous_block_hash: string;
    txn_hashes: string[];
    total_amount: number;
    total_fee: number;
    txn_cnt: number;
    time_stamp: string;
}

const Stream: React.FC<StreamProps> = ({setTransactionData, setBlockData}) => {
    const [transaction, setTransaction] = useState<any[]>([]);
    const [block, setBlock] = useState<any[]>([]);
    const [isInitialBlocksSet, setIsInitialBlocksSet] = useState<boolean>(false);
    const [transactionPool, setTransactionPool] = useState<any[]>([]);
    const [initialTime, setInitialTime] = useState(new Date());
    const [count, setCount] = useState(0);
    
    const updateCount = (newCount: number) => {
        setCount(count + newCount);
    }
    
    const addTransactionToPool = (txn: any) => {
        setTransactionPool(prevTransactionPool => [...prevTransactionPool, txn]);
    };
    
    const addBlock = (newBlocks: any) => {
        setBlock(prevBlock => [...prevBlock, ...newBlocks]);
    };
    
    useEffect(() => {
        const fetchInitialBlocks = async () => {
            try {
                const blocks = await Service.getInitialBlocks();
                addBlock(blocks);
            } catch (error) {
                console.error(error);
            }
        }
        
        if (!isInitialBlocksSet) {
            fetchInitialBlocks();
            setIsInitialBlocksSet(true);
        }
    }, []);
    
    useEffect(() => {
        const fetchStreamData = async () => {
            try {
                const current_time = new Date();
                const start_time = initialTime.toISOString();
                const end_time = current_time.toISOString();
                setInitialTime(current_time);
                const streamData = await Service.getStreamData(start_time, end_time);
                setTransaction(streamData.transactions);
                updateCount(streamData.transactions.length);
                addBlock(streamData.blocks);
                const txnsToRemove: string[] = [];
                for (let i = 0; i < streamData.blocks.length; i++) {
                    txnsToRemove.push(streamData.blocks[i].txn_hashes);
                }
                setTransactionPool(prevTransactionPool => prevTransactionPool.filter(txn => !txnsToRemove[0].includes(txn.txn_hash)));

            } catch (error) {
                console.error(error);
            }
        };
        
        const intervalId = setInterval(fetchStreamData, 10000);
        return () => {
            clearInterval(intervalId);
        };
    }, [initialTime]);
    
    return (
        <div className="container mx-auto">
            <Transaction transaction={transaction} addTransactionToPool={addTransactionToPool} />
            <TransactionPool poolTransaction={transactionPool} setTransactionData={setTransactionData} count={count}/>
            <div className='flex items-center justify-center mt-8'>
                <BlockCarousel>
                    {block.map((b, index) => (
                        <Card
                            key={index}
                            title={b.block_hash}
                            content={b}
                            setBlockData={setBlockData}
                        />
                    ))}
                </BlockCarousel>
            </div>
        </div>
    );
};

export default Stream;