
const { Forbidden, InternalServerError, Unauthorized } = require("http-errors");

class getTotalNewCreated {

    static async getTotalNewCreatedInLastSevenDays(model, query) {
        try {

            // let endDate = new Date();
            // endDate.setDate(endDate.getDate() - 1);
        
            let sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            query = {
                clientId: query.clientId,
                createdAt: {
                    $gte: sevenDaysAgo
                }
            }
            let results = await model.countDocuments(query);
            if (!results) {
                throw Unauthorized("data does not exist");
            }
            return results;
        } catch (error) {
            throw Unauthorized(error);
        }
    };
}

module.exports = getTotalNewCreated;