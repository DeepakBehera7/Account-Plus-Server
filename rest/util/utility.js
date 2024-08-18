function rowToJsonPaymentResponse(rawdata){
    const groupped = rawdata.reduce((result, row) => {
        result[row.payment_vch_no] = result[row.payment_vch_no] || {
          payment_vch_no: row.payment_vch_no,
          payment_vch_date: row.payment_vch_date,
	  payment_vch_desc: row.payment_vch_desc,
          transactions: {},
        };
      
        result[row.payment_vch_no].transactions[row.daybook_payment_id] = {
          daybook_payment_id: row.daybook_payment_id,
          payment_vch_date: row.payment_vch_date,
          payment_vch_no: row.payment_vch_no,
          payment_vch_ty: row.payment_vch_ty,
          payment_vch_type: row.payment_vch_type,
          payment_vch_amt: row.payment_vch_amt,
          account_desc: row.account_desc,
          payment_vch_close: row.payment_vch_close
        };
      
        return result;
      }, {});
      
      const final = Object.values(groupped).map((poll) => {
        poll.transactions = Object.values(poll.transactions);
        return poll;
      });
      
      console.log(JSON.stringify(final));
      return final;
}

function rowToJsonReceivedResponse(rawdata){
  const groupped = rawdata.reduce((result, row) => {
      result[row.receipt_vch_no] = result[row.receipt_vch_no] || {
        receipt_vch_no: row.receipt_vch_no,
        receipt_vchno_date: row.receipt_vchno_date,
	receipt_vch_desc: row.receipt_vch_desc,
        transactions: {},
      };
    
      result[row.receipt_vch_no].transactions[row.daybook_received_id] = {
        daybook_received_id: row.daybook_received_id,
        receipt_vchno_date: row.receipt_vchno_date,
        receipt_vch_no: row.receipt_vch_no,
        receipt_vch_ty: row.receipt_vch_ty,
        receipt_vch_type: row.receipt_vch_type,
        receipt_vch_desc: row.receipt_vch_desc,
        receipt_vch_amt: row.receipt_vch_amt,
        account_desc: row.account_desc,
        receipt_vch_close: row.receipt_vch_close
      };
    
      return result;
    }, {});
    
    const final = Object.values(groupped).map((poll) => {
      poll.transactions = Object.values(poll.transactions);
      return poll;
    });
    
    console.log(JSON.stringify(final));
    return final;
}

module.exports={
  rowToJsonReceivedResponse,
  rowToJsonPaymentResponse
}