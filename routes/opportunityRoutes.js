import express from 'express';
const router = express.Router();

import { 
    createOpportunity, 
    getOpportunities, 
    deleteOpportunity 
} from '../controllers/opportunityController.js'; 

//  Routes Definitions

router.post('/', createOpportunity);      


router.get('/', getOpportunities);        
router.delete('/:id', deleteOpportunity); 


export default router;