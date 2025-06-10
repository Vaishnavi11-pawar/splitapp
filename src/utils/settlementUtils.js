export const calculateBalances = (expenses) => {
    const balances = {};

    for (const exp of expenses) {
        const { amount, paid_by, shared_between, split_type, split_details } = exp;
        let shareMap = {};

        // calculating the shares
        if (split_type === "equal") {
            const share = amount / shared_between.length;
            shared_between.forEach(p => shareMap[p] = share);
        } else if (split_type === "percentage") {
            shared_between.forEach(p => {
                const percent = split_details[p] || 0;
                shareMap[p] = (percent / 100) * amount;
            });
        } else if (split_type === "exact") {
            shareMap = split_details;
        }

        // subtracting the shares
        for (const person of shared_between) {
            if (!balances[person]) balances[person] = 0;
            balances[person] -= shareMap[person] || 0;
        }

        if (!balances[paid_by]) balances[paid_by] = 0;
        balances[paid_by] += amount;
    }

    return balances;
};



export const simplifySettlements = (balances) => {
    const transactions = [];
    const owes = [];
    const owed = [];

    for (const [person, amount] of Object.entries(balances)) {
        if (amount < 0) owes.push({person, amount: -amount});
        else if (amount > 0) owed.push({person, amount});
    }

    owes.sort((a,b) => b.amount - a.amount);
    owed.sort((a, b) => b.amount - a.amount);

    while (owes.length && owed.length) {
        const debtor = owes[0];
        const creditor = owed[0];
        const payment = Math.min(debtor.amount, creditor.amount);

        transactions.push({ from: debtor.person, to: creditor.person, amount: payment });

        debtor.amount -= payment;
        creditor.amount -= payment;

        if (debtor.amount === 0) owes.shift();
        if (creditor.amount === 0) owed.shift();
    }

    return transactions;

};