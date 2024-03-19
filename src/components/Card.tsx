import React from 'react';
import './Carousel.css'; 
import Service from '../services/Service';

interface CardProps {
    title: string;
    content: Block;
    setBlockData: (blockData: any) => void;
}

interface Block {
    block_hash: string;
    total_amount: number;
    total_fee: number;
    txn_cnt: number;
}

const Card: React.FC<CardProps> = ({ title, content, setBlockData }) => {
    
    const handleViewBlock = (blockId: string) => {
        const fetchBlockData = async () => {
            try {
                const blockData: any = await Service.getBlockData(blockId);
                setBlockData(blockData);
            } catch (error) {
                console.error(error);
            }
        };
        
        fetchBlockData();
    }
    
    return (
        <div className="card bg-gray-800 text-white rounded-lg shadow-lg">
            <h2 className="font-semibold">BLOCK : { title }</h2>
            <div className="block-card bg-gray-700 rounded-lg p-4 mb-1 text-center">
                <p className="font-semibold text-gray-300">Total Amount:</p>
                <p className="text-green-400">{content.total_amount}</p>
                <p className="font-semibold text-gray-300">Total Fee:</p>
                <p className="text-green-400">{content.total_fee}</p>
                <p className="font-semibold text-gray-300">No of Transactions:</p>
                <p className="text-green-400">{content.txn_cnt}</p>
            </div>
            <div className='text-center b-2'>
                <button onClick={() => handleViewBlock(content.block_hash)}><span className="text-white font-bold">View More</span></button>
            </div>
        </div>
    );
};

export default Card;