const utilcomponent = require('../util/utility');

const getTableData = (req, res, db) => {
  db.select('*').from('budget_master')
    .then(items => {
      if (items.length) {
        res.json(items)
      } else {
        res.json({ dataExists: 'false' })
      }
    })
    .catch(err => res.status(400).json({ dbError: err }))
}

const getAllRecords = (req, res, db) => {
  const { table_name } = req.body
  db.select('*').from(table_name + '_master')
    .then(items => {
      if (items.length) {
        res.json(items)
      } else {
        res.json([])
      }
    })
    .catch(err => res.status(400).json({ dbError: err }))
}

const getAllRecordsReverse = (req, res, db) => {
  const { table_name } = req.body
  db.select('*').from(table_name + '_master').orderBy('seq_no', 'desc')
    .then(items => {
      if (items.length) {
        res.json(items)
      } else {
        res.json([])
      }
    })
    .catch(err => res.status(400).json({ dbError: err }))
}


const get_all_scheme_obmaster = (req, res, db) => {
  const { table_name } = req.body
  db.select('id', 'name').from(table_name + '_master')
    .then(items => {
      if (items.length) {
        res.json(items)
      } else {
        res.json([])
      }
    })
    .catch(err => res.status(400).json({ dbError: err }))
}

const insertTableData = (req, res, db) => {
  const { id, name, created_by, modified_by, table_name } = req.body
  const added = new Date()
  db(table_name + '_master')
    .select('*')
    .where({ name })
    .then(rows => {
      if (rows.length > 0) {
        res.status(400).json({ message: "Scheme already exists" });
      } else {
        db(table_name + '_master')
          .insert({ id, name, created_by, modified_by })
          .returning('*')
          .then(item => {
            res.json({ status: "SUCCESS" });
          })
          .catch(err => res.status(400).json({ dbError: err.message }));
      }
    })
    .catch(err => res.status(400).json({ dbError: err.message }));
};


const insert_acc_budget_map = (req, res, db) => {
  const { acc_id, acc_name, budget_id, budget_name, table_name } = req.body
  db(table_name + '_master').insert({ acc_id, acc_name, budget_id, budget_name })
    .returning('*')
    .then(item => {
      db.select('*').from(table_name + '_master')
        .then(items => {
          if (items.length) {
            res.json(items)
          } else {
            res.json({ dataExists: 'no data' })
          }
        })
        .catch(err => res.status(400).json({ dbError: err }))
    })
    .catch(err => res.status(400).json({ dbError: err.message }))
}


const update_acc_budget_map = (req, res, db) => {
  // Assuming 'db' is a valid database connection
  const { acc_id, acc_name, budget_id, budget_name, seq_no } = req.body;
  // const q ="UPDATE acc_budget_map_master SET acc_id = ?, acc_name = ?, budget_id = ?, budget_name = ? WHERE seq_no = ?";
  const values = [acc_id, acc_name, budget_id, budget_name, seq_no];
  db("acc_budget_map_master").where({ seq_no }).update({ acc_id, acc_name, budget_id, budget_name })
    .returning('*')
    .then(item => {
      db.select('*').from("acc_budget_map_master")
        .then(items => {
          if (items.length) {
            res.json(items)
          } else {
            res.json({ dataExists: 'false' })
          }
        })
        .catch(err => res.status(400).json({ dbError: err }))
    })
    .catch(err => res.status(400).json({ dbError: err.message }))
};


const get_indivisual_budget_max_seq = (req, res, db) => {
  const { budgetName } = req.body
  db('acc_budget_map_master')
    .select('budget_name')
    .count('budget_name as RepetitionCount')
    .where({ budget_name: budgetName })
    .groupBy('budget_name')
    .then((items) => {
      if (items.length) {
        res.json(items);
      } else {
        res.json("no row inserted yet")
      }
    })
    .catch((err) => {
      res.status(500).json({ error: "Internal Server Error" });
    });
};


const checkVoucherNumberExistOrNot = (req, res, con) => {
  const table_name = "outward_vchentry_view";
  const q = "SELECT * FROM " + table_name + " WHERE vch_no = ?";
  con.connect((err) => {
    if (err) {
      res.status(500).json({ error: "Database connection error" });
    } else {
      con.query(q, [req.body.vch_number], (err, result, fields) => {
        if (err) {
          res.status(500).json({ error: "Database query error" });
        } else {
          if (result.length > 0) {
            res.status(200).json("vch_no already exists");
          } else {
            res.status(200).json("You can insert a new record");
          }
        }
      });
    }
  });
};


const insert_outWordVoucher = (req, res, con) => {
  const Chq_no = null
  const Chq_date = null
  const { Scheme_name, vch_no, Vch_type, Vch_date,Bank_name, Vch_desc, total_Amount, table_name,Financial_year } = req.body;
  const values = [Scheme_name, vch_no, Vch_type, Vch_date, Chq_no, Chq_date, Bank_name, Vch_desc, total_Amount,Financial_year]
  const q = "select * from " + table_name + " where vch_no = ? ";
  con.connect((err) => {
    if (err) {
      res.status(500).json({ error: "Database connection error" })
    } else {
      con.query(q, [vch_no], (err, result, feilds) => {
        if (err) {
          res.status(500).json({ error: "Voucher No ALready Exist" })
        }
        if (result.length === 0) {
          const q1 = "INSERT INTO " + table_name + " (Scheme_name, vch_no, Vch_type, Vch_date, Chq_no, Chq_date, Bank_name, Vch_desc, total_Amount,financial_year) VALUES (?)"
          con.query(q1, [values], (err, result, fields) => {
            if (!err) {
              res.json("Record Inserted");
            }
            else {
              res.status(400).json({ Error1: err })
            }
          })
        } else {
          res.status(400).json({ error: "Voucher No Already Exists" });
        }
      })
    }
  })
}

const insert_obmaster = (req, res, db) => {
  const { scheme_id, scheme_name, budget_id, budget_name, acc_id, acc_name, amt_pay, amt_rec, table_name } = req.body
  db(table_name + '_master').insert({ scheme_id, scheme_name, budget_id, budget_name, acc_id, acc_name, amt_pay, amt_rec })
    .returning('*')
    .then(item => {
      db.select('*').from(table_name + '_master').orderBy('seq_no', 'desc')
        .then(items => {
          if (items.length) {
            res.json(items)
          } else {
            res.json({ dataExists: 'false' })
          }
        })
        .catch(err => res.status(500).json({ dbError7: err }))
    })
    .catch(err => res.status(400).json({ dbError3: err.message }))
}

const updateInsert_obMaster = (req, res, db) => {
  const { amt_pay, amt_rec, table_name, seq_no } = req.body
  db(table_name + '_master').where({ seq_no }).update({ amt_pay, amt_rec })
    .returning('*')
    .then(item => {
      db.select('*').from(table_name + '_master').orderBy('seq_no', 'desc')
        .then(items => {
          if (items.length) {
            res.json(items)
          } else {
            res.json({ dataExists: 'false' })
          }
        })
        .catch(err => res.status(500).json({ dbError7: err }))
    })
    .catch(err => res.status(400).json({ dbError3: err.message }))
}

const inset_ObMust = (req, res, db) => {
  const { scheme_id, scheme_name, budget_id, budget_name, acc_id, acc_name, table_name } = req.body
  db(table_name + '_master').insert({ scheme_id, scheme_name, budget_id, budget_name, acc_id, acc_name }).returning("*")
    .then(item => {
      res.json("Record Inserted")
    }).catch(err => res.status(400).json({ dbError: err.message }))
}


const get_all_accountDes = (con, req, res) => {
  const { scheme_name, voucher_type, to_from } = req.body;
  let qry = "";
  try {
    if (voucher_type == "BR" && to_from == "to") {
      qry =
        "select acc_id, acc_name from account_plus.obmaster_master " +
        " where scheme_name='" + scheme_name + "' and budget_name = 'BANK'";
    } else if (voucher_type == "BR" && to_from == "from") {
      qry =
        "select acc_id, acc_name from account_plus.acc_budget_map_master where " +
        " budget_name ='INCOME'";
    } else if (voucher_type == "CR" && to_from == "to") {
      qry =
        "select acc_id, acc_name from account_plus.obmaster_master where " +
        "scheme_name ='" + scheme_name + "' and budget_name ='CASH-IN-HAND'";
    } else if (voucher_type == "CR" && to_from == "from") {
      qry =
        "select acc_name FROM account_plus.acc_budget_map_master where " +
        "budget_name = 'INCOME'";
    } else if (voucher_type == "BP" && to_from == "to") {
      qry =
        "SELECT acc_name,acc_id FROM account_plus.acc_budget_map_master where " +
        "budget_name = 'EXPENDITURE' or budget_name = 'ADVANCE' or budget_name = 'LIBILITIES'";
    } else if (voucher_type == "BP" && to_from == "from") {
      qry =
        "select acc_id, acc_name from account_plus.obmust_master where " +
        "scheme_name ='" + scheme_name + "' and budget_name ='BANK'";
    } else if (voucher_type == "JV" && to_from == "from") {
      qry =
        "select acc_name,acc_id FROM account_plus.acc_budget_map_master where " +
        "budget_name = 'ADVANCE' or budget_name = 'LIBILITIES'";
    } else if (voucher_type == "JV" && to_from == "to") {
      qry =
        "select acc_id, acc_name from account_plus.acc_budget_map_master where " +
        "budget_name ='EXPENDITURE'";
    } else if (voucher_type == "CO" && to_from == "from" || to_from == "to") {
      qry =
        "select acc_id, acc_name from account_plus.obmaster_master where " +
        "scheme_name ='" + scheme_name + "' and (budget_name ='CASH-IN-HAND' or budget_name ='BANK')";
    }
    // else if (voucher_type == "CR" && to_from == "to") {
    //   qry =
    //     "select acc_id, acc_name from account_plus.obmaster_master where " +
    //     "scheme_name ='" + scheme_name + "' and budget_name ='CASH-IN-HAND   or budget_name ='BANK";
    // }
    else {
      qry = "";
    }
    
    con.connect(function (err) {
      if (err) {

        res.status(500).json({ error: "Database connection error" });
        return;
      }

      con.query(qry, function (err, result, fields) {
        if (err) {
          res.status(500).json({ error: "Database query error" });
          return;
        }

        if (result.length > 0) {
          res.json(result);
        } else {
          res.json([]);
        }
      });
    });
  } catch (error) {
    res.status(500).json({ error: "An unexpected error occurred" });
  }
};

const get_AccountDetails = (req, res, con) => {
  const { table_name, budget_name } = req.body
  const qry = "select acc_id, acc_name from account_plus.acc_budget_map_master where budget_name='" + budget_name + "'"
  con.connect(function (err) {
    con.query(qry, function (err, result, fields) {
      if (result.length > 0) {
        res.json(result)
      }
      else {
        res.json([])
      }
    });
  });
}

const insertMapData = (con, req, res, db) => {
  const { budget_id, account_id } = req.body
  const added = new Date()
  const qry = "SELECT count(1) as cnt FROM budget_account_sync where budget_id='" + budget_id + "' and account_id='" + account_id + "'"
  const insertQuery = "INSERT INTO budget_account_sync values('" + budget_id + "','" + account_id + "')"
  con.connect(function (err) {
    con.query(qry, function (err, result, fields) {
      if (result[0].cnt > 0)
        res.json("Record Present")
      else {
        insertRecordToDB(con, insertQuery)
        res.json("Data Inserted")
      }
    });
  });
}


const insert_family_perticular = (con, req, res, db) => {
  const items = req.body
  con.connect(function (err) {
    con.query(
      'INSERT INTO family_perticulars (name, age, gender, salary, houseNo) VALUES ?',
      [items.map(item => [item.name, item.age, item.gender, item.salary, item.houseNo])],
      (error, results) => {
      }
    );
  });
}

const insert_inWordVoucher = (con, req, res) => {
  const items = req.body;
  con.connect(function (err) {
    con.query(
      'INSERT INTO inword_vchentry (scheme_name,account_desc,amount_rec,amount_pay,vch_ty,vchno,acc_id,vch_type,vch_date,Financial_year) VALUES ?',
      [items.map(item => [item.scheme_name, item.accountDesName, item.accountFrom, item.accountTo, item.accountTy, item.vch_no, item.acc_id, item.vch_type, item.vch_date,item.Financial_year])],
      (error, results) => {
        if (results?.insertId > 0) {
          res.json("Record Inserted")
        } else {
          res.status(500).json({ error: "No records were inserted" });
        }
      }
    );
  })
}

const insert_familyy_perticular = (con, req, res, db) => {
  const items = req.body
  con.connect(function (err) {
    con.query(
      'INSERT INTO school_status (fname, age, gender, salary, rollno) VALUES ?',
      [items.map(item => [item.fname, item.age, item.gender, item.salary, item.rollno])],
      (error, results) => {
        console.log(error)
      }
    );
  });
}

const searchForrollno = (con, req, res) => {
  const rollno = req.body
  const qry = "SELECT * from school_status where rollno = '" + rollno.rollno + "'"
  con.connect(function (err) {
    con.query(qry, function (err, result, fields) {
      if (err) throw err;
      res.json(result)
    });
  });
}

const searchVoucher_outWard = (req, res, con) => {
  const { vch_no } = req.body;
  const qry = "SELECT * FROM outward_vchentry_view WHERE vch_no = ? ";
  con.connect((err) => {
    if (!err) {
      con.query(qry, [vch_no], (err, result) => {
        if (!err) {
          if (result.length > 0) {
            // STR_TO_DATE(vch_date, '%Y-%d-%M') AS vch_date
            const qry1 = "SELECT scheme_name,vchno,vch_ty,account_desc,amount_pay,amount_rec,acc_id,vch_type,CONVERT_TZ(vch_date, '+00:00', '+05:30') AS vch_date,financial_year FROM inword_vchentry WHERE vchno = ? ORDER BY id";
            con.query(qry1, [vch_no], (err, result1) => {
              if (err) {
                res.status(500).json({ error: "Error in the second query" });
              } else {
                res.json({ outward_vchentry: result, inword_vchentry: result1 });
              }
            })
          } else {
            res.json("No record found")
          }
        } else {
          res.status(500).json({ error: "NO record found" });
        }
      })
    } else {
      res.status(500).json({ error: "Database connection error" });
    }
  })
}


const recent_add_voucher = (req, res, con) => {
  let query = "select scheme_name,vch_no,total_Amount from outward_vchentry_view ORDER BY id DESC LIMIT 10"
  con.connect((err) => {
    if (!err) {
      con.query(query, (err, results) => {
        if (!err) {
          res.json({ recentVoucherList: results });
        } else {
          res.status(400).json({ error: "NOT able to fetch data." });
        }
      })
    } else {
      res.status(500).json({ error: "Database connection error" });
    }
  })
}


const VoucherList_forEdit = (req, res, con) => {
  const { scheme_name, start_date, end_date } = req.body.temp;
  let query = "SELECT scheme_name,vch_no,vch_type,vch_desc,vch_date FROM outward_vchentry_view WHERE scheme_name = ?";
  let queryParams = [scheme_name];

  if (start_date !== null && end_date !== null) {
    query += " AND vch_date BETWEEN ? AND ?";
    queryParams.push(start_date, end_date);
  }
  con.query(query, queryParams, (err, result) => {
    if (err) {
      res.status(500).json({ error: "Internal server error" });
      return;
    }
    res.status(200).json(result);
  });
}


const DeleteVoucher = (req, res, con) => {
  const { vch_no, scheme_name, start_date, end_date } = req.body.temp;
  const vchno = vch_no;
  const qry1 = "DELETE FROM inword_vchentry WHERE vchno = ?";
  const qry2 = "DELETE FROM outward_vchentry_view WHERE vch_no = ?";

  if ((scheme_name || start_date || end_date) && vch_no) {
    con.query(qry1, [vchno], (err, result1) => {
      if (err) {
        res.status(500).json({ error: "Failed to delete from inword_vchentry" });
        return;
      }

      con.query(qry2, [vch_no], (err, result2) => {
        if (err) {
          res.status(500).json({ error: "Failed to delete from outward_vchentry_view" });
          return;
        }

        if (scheme_name) {
          let query = "SELECT scheme_name,vch_no,vch_type,vch_desc,vch_date FROM outward_vchentry_view WHERE scheme_name = ?";
          let queryParams = [scheme_name];
  
          if (start_date && end_date) {
            query += " AND vch_date BETWEEN ? AND ?";
            queryParams.push(start_date, end_date);
          }
  
          con.query(query, queryParams, (err, result3) => {
            if (err) {
              res.status(500).json({ error: "Failed to fetch data from outward_vchentry_view" });
              return;
            }
  
            res.status(200).json(result3);
          });
        } else {
          res.status(200).json({ response: `successfully deleted.` });
        }
      });
    });
  } else {
    con.query(qry1, [vchno], (err, result1) => {
      if (err) {
        res.status(500).json({ error: "Failed to delete from inword_vchentry" });
        return;
      }

      con.query(qry2, [vch_no], (err, result2) => {
        if (err) {
          res.status(500).json({ error: "Failed to delete from outward_vchentry_view" });
          return;
        }
        res.status(200).json({ response: `Record successfully deleted.` });
      });
    });
  }
};

const insert_Edited_voucher = (req, res, con) => {
  const data = req.body;
  const Chq_no = null;
  const Chq_date = null;
  const { Scheme_name, vch_no, Vch_type, Vch_date, Bank_name, Vch_desc, total_Amount, inWord_allRows,Financial_year } = req.body;
  const valuesForOutWard = [Scheme_name, vch_no, Vch_type, Vch_date, Chq_no, Chq_date, Bank_name, Vch_desc, total_Amount,Financial_year];
  const valuesForInWord = inWord_allRows;

  if (!data.vch_no) {
    res.status(400).json({ error: "Voucher number (vch_no) is required" });
    return;
  }

  con.connect((err) => {
    if (err) {
      res.status(500).json({ error: "Database connection error" });
      return;
    }

    con.beginTransaction((transactionErr) => {
      if (transactionErr) {
        con.rollback(() => {
          res.status(500).json({ error: "Transaction error" });
        });
      } else {
        // Define queries
        const q1 = "DELETE FROM outward_vchentry_view WHERE vch_no = ?";
        const q2 = `INSERT INTO outward_vchentry_view (Scheme_name, vch_no, Vch_type, Vch_date, Chq_no, Chq_date, Bank_name, Vch_desc, total_Amount,financial_year) VALUES (?)`;
        const q3 = "DELETE FROM inword_vchentry WHERE vchno = ?";
        const q4 = "INSERT INTO inword_vchentry (scheme_name,account_desc,amount_rec,amount_pay,vch_ty,vchno,acc_id,vch_type,vch_date,financial_year) VALUES ?";

        con.query(q1, [vch_no], (err, results) => {
          if (err) {
            con.rollback(() => {
              res.status(500).json({ error: "Error deleting from outward_vchentry_view" });
            });
            return;
          }

          con.query(q2, [valuesForOutWard], (err, results) => {
            if (err) {
              con.rollback(() => {
                res.status(500).json({ error: "Error inserting into Outward_vchentry" });
              });
              return;
            }

            con.query(q3, [vch_no], (err, results) => {
              if (err) {
                con.rollback(() => {
                  res.status(500).json({ error: "Error deleting from inword_vchentry" });
                });
                return;
              }

              const mapValuesForInWord = valuesForInWord.map(item => [item.scheme_name, item.accountDesName, item.accountFrom, item.accountTo, item.accountTy, item.vch_no, item.acc_id, item.vch_type, item.vch_date,item.Financial_year]);
              con.query(q4, [mapValuesForInWord], (err, results) => {
                if (err) {
                  con.rollback(() => {
                    res.status(500).json({ error: "Error inserting into inword_vchentry" });
                  });
                } else {
                  con.commit(() => {
                    res.json('Data inserted successfully');
                  });
                }
              });
            });
          });
        });
      }
    });
  });
};



const getMaxSeqNo = (con, req, res, db) => {
  const { table_name } = req.body
  const qry = "select max(seq_no) as max_seq from " + table_name ;
  const qry1 = `SELECT MAX(id) as max_seq FROM ${table_name}`;
  const finalQry = table_name === 'outward_vchentry_view' ? qry1 : qry;

  con.connect(function (err) {
    if (err) throw err;  

    con.query(finalQry, function (err, result, fields) {
      if (err) throw err;  

      res.json(result);
    });
  });
}

const insertRecordToDB = (con, qry) => {
  con.connect(function (err) {
    con.query(qry, function (err, result, fields) {
      if (err) throw err;
    });
  });
}


const deleteTableData = (req, res, con) => {
  const { budget_id, acc_id, table_name } = req.body
  const qry = "delete  FROM " + table_name + "_master where budget_id='" + budget_id + "' and acc_id='" + acc_id + "'"
  con.connect(function (err) {
    con.query(qry, function (err, result, fields) {
      if (err != '') { console.log(err) }
      const qry1 = "select * from " + table_name + "_master"
      con.query(qry1, function (err, result, fields) {
        if (err != '') { console.log(err) }
        res.json(result)
      });
    });
  });
}

const loginToken = (req, res, db) => {
  const { userid, password } = req.body
  db('usertable').where({ userid }).where({ password })
    .then(item => {
      if (item.length == 1) {
        res.json({ token: userid + password, dataExists: 'true' })
      } else (
        res.json({ dataExists: 'false' })
      )
    })
    .catch(err => res.status(400).json({ dbError: err }))
}

const processMaster = (req, res, db) => {
  const startDate = req.body.Vch_start_date;
  const endDate = req.body.Vch_end_date;
  const schemeName = req.body.Scheme_name;
  db.query("call loadMasterTbl_dated(?,?,?);", [startDate, endDate, schemeName], (err, data) => {
    if (err) return res.json({ error: err.sqlMessage });
    else {
      db.query("select * from master_date;", (err, dataResponse) => {
        if (err) return res.json({ error: err.sqlMessage });
        else return res.json({ dataResponse });
      });
    }
  });
};

const processDaybook = (req, res, db) => {
  const startDate = req.body.Vch_start_date;
  const endDate = req.body.Vch_end_date;
  const schemeName = req.body.Scheme_name;
  db.query("call loadDaybookTbl_dated(?,?);", [startDate, endDate], (err, data) => {
    if (err) return res.json({ error: err.sqlMessage });
    else {
      db.query("select * from daybook_payment;", (errpay, datapayment) => {
        if (errpay) return res.json({ error: errpay.sqlMessage });
        else {
          db.query("select * from daybook_received;", (errrec, datareceived) => {
            if (errrec) return res.json({ error: errrec.sqlMessage });
            else {
              const datapaymentres = utilcomponent.rowToJsonPaymentResponse(datapayment);
              const datareceivedres = utilcomponent.rowToJsonReceivedResponse(datareceived);
              const dataResponse = { datapaymentres, datareceivedres };
              return res.json(dataResponse);
            }
          })
        }
      });
    }
  });
};

const fetchDaybookObCb = (req, res, db) => {
  const startDate = req.body.Vch_start_date;
  const endDate = req.body.Vch_end_date;
  db.query("select * from master_date where entry_date between ? and ?", [startDate, endDate], (err, data) => {
    if (err) return res.json({ error: err.sqlMessage });
    else {
      return res.json({ data });
    }
  });
};


//trial balance

const getAccNameAsperScheme =(req,res,db)=>{
  const schemeName = req.body.schemeName
  db.query("select acc_name from account_plus.obmaster_master where Scheme_name = ?", [schemeName], (err,data)=>{
    if (err) return res.json({error:err.sqlMessage});
      else{
        return res.json({ data });
      }
  })
}

const getAllRecordsForTrailBalance = (req, res, db) => {
  const { schemeName, accountName, startDate, endDate } = req.body.temp;

  const query = `
      SELECT 
          i.id AS inword_view_id,
          i.scheme_name,
          i.vchno,
          i.vch_ty,
          i.account_desc,
          i.amount_rec,
          i.amount_pay,
          i.acc_id,
          i.vch_type,
          i.vch_date,
          COALESCE(o.vch_desc, '') AS vch_des
      FROM 
          account_plus.inword_vchentry i
      LEFT JOIN 
          account_plus.outward_vchentry_view o 
      ON 
          i.vchno = o.vch_no
      WHERE 
          i.scheme_name = ? 
          AND i.account_desc = ? 
          AND i.vch_date BETWEEN ? AND ?
  `;

  db.query(query, [schemeName, accountName, startDate, endDate], (err, data) => {
    if (err) {
      return res.status(500).json({ error: err.sqlMessage });
    }
    return res.json({ data });
  });
};

module.exports = {
  getTableData,
  insertTableData,
  deleteTableData,
  loginToken,
  getMaxSeqNo,
  getAllRecords,
  getAllRecordsReverse,
  insertMapData,
  insert_acc_budget_map,
  inset_ObMust,
  update_acc_budget_map,
  get_AccountDetails,
  insert_obmaster,
  updateInsert_obMaster,
  insert_inWordVoucher,
  insert_family_perticular,
  get_all_accountDes,
  get_all_scheme_obmaster,
  insert_outWordVoucher,
  searchVoucher_outWard,VoucherList_forEdit,recent_add_voucher,
  DeleteVoucher,
  insert_Edited_voucher,
  processMaster,
  processDaybook,
  get_indivisual_budget_max_seq,
  checkVoucherNumberExistOrNot,
  fetchDaybookObCb,
  getAccNameAsperScheme,
  getAllRecordsForTrailBalance
}
