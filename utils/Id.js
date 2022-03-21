class Id {
    constructor(allDocs, specificQuery, toCheck) {
        // id
        let idsNow = []; // ids en uso actualmente
        let newId = 1;

        for (let i = 0; i < allDocs.length; i++) {
            const document = allDocs[i];
            
            let forEachLoop = document;
            let split = specificQuery.split(".");

            if(split && split.length >= 1 && split[0].length > 0){
                for (let i = 0; i < split.length; i++) {
                    const queryQ = split[i];
                    
                    forEachLoop = forEachLoop[queryQ]
                }

                if(Array.isArray(forEachLoop)) forEachLoop.forEach(i => {
                    idsNow.push(i[toCheck]); // pushear cada id en uso
                });
                else idsNow.push(forEachLoop[toCheck]);

            } else {
                idsNow.push(forEachLoop[toCheck])
            }
        }

        while (idsNow.find(x => x === newId)){ // mientras se encuentre la id en las que ya están en uso sumar una hasta que ya no lo esté
            newId++;
        }

        this.newId = newId;
    }
}

module.exports = Id;