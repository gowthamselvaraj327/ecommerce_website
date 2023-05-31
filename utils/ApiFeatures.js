class ApiFeatures{
    constructor(query, querystr){
        this.query = query;
        this.querystr = querystr;
    }

    search(){
        let keyword = this.querystr.keyword ? {
            name : {
                $regex: this.querystr.keyword,
                $options : 'i'
            }
        }: {}
        this.query.find({...keyword})
        return this;
    }

    filter(){
        const querystrCopy = {...this.querystr};
         
        const removeFields = ['keyword', 'limit', 'page'];
        removeFields.forEach(field => delete querystrCopy[field]);

        let querystr = JSON.stringify(querystrCopy)
        querystr = querystr.replace(/\b(gt|gte|lt|lte)/g, match => `$${match}`)

        this.query.find(JSON.parse(querystr))
        return this;         
    }

    paginate(resPerPage){
        const currentPage = Number(this.querystr.page) || 1;
        const skip = resPerPage * (currentPage -1);
        this.query.limit(resPerPage).skip(skip);
        return this;
    }
}

module.exports = ApiFeatures;