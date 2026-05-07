import Opportunity from '../model/Opportunity.js'; 

//  Named Export: createOpportunity
export const createOpportunity = async (req, res) => {
    try {
        const newOpp = new Opportunity(req.body);
        await newOpp.save();
        res.status(201).json({ success: true, data: newOpp });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

//  Named Export: getOpportunities
export const getOpportunities = async (req, res) => {
    try {
        const opps = await Opportunity.find().sort({ createdAt: -1 });
        res.status(200).json(opps);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

//  Named Export: deleteOpportunity
export const deleteOpportunity = async (req, res) => {
    try {
        await Opportunity.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "Deleted Successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};