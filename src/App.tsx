  import { Fragment, useCallback, useEffect, useMemo, useState } from "react"
  import { InputSelect } from "./components/InputSelect"
  import { Instructions } from "./components/Instructions"
  import { Transactions } from "./components/Transactions"
  import { useEmployees } from "./hooks/useEmployees"
  import { usePaginatedTransactions } from "./hooks/usePaginatedTransactions"
  import { useTransactionsByEmployee } from "./hooks/useTransactionsByEmployee"
  import { EMPTY_EMPLOYEE } from "./utils/constants"
  import { Employee } from "./utils/types"

  export function App() {
    const { data: employees, ...employeeUtils } = useEmployees()
    const { data: paginatedTransactions, ...paginatedTransactionsUtils } = usePaginatedTransactions()
    const { data: transactionsByEmployee, ...transactionsByEmployeeUtils } = useTransactionsByEmployee()
    const [showViewMore, setShowViewMore] = useState(false)

    const transactions = useMemo(
      () => paginatedTransactions?.data ?? transactionsByEmployee ?? null,
      [paginatedTransactions, transactionsByEmployee]
    )

    const loadAllTransactions = useCallback(async () => {
      await employeeUtils.fetchAll() 
      await paginatedTransactionsUtils.fetchAll() 
    }, [employeeUtils, paginatedTransactionsUtils])

    const loadTransactionsByEmployee = useCallback( 
      async (employeeId: string) => {
        paginatedTransactionsUtils.invalidateData()
        await transactionsByEmployeeUtils.fetchById(employeeId)
      }, [paginatedTransactionsUtils, transactionsByEmployeeUtils]
    )

    const shouldShowLoadMore = useCallback(
      async () => {
        if (paginatedTransactions !== null) {
          if (paginatedTransactions.nextPage !== null) {setShowViewMore(true) }
          else { setShowViewMore(false) }
        } else { setShowViewMore(false) }
      }, [paginatedTransactions]
    )

    useEffect(() => {
      if (employees === null && !employeeUtils.loading) loadAllTransactions()
      shouldShowLoadMore()
    }, [employeeUtils.loading, employees, loadAllTransactions, transactionsByEmployee, paginatedTransactions, shouldShowLoadMore])


    return (
      <Fragment>
        <main className="MainContainer">
          <Instructions />

          <hr className="RampBreak--l" />

          <InputSelect<Employee>
            isLoading={employeeUtils.loading}
            defaultValue={EMPTY_EMPLOYEE}
            items={employees === null ? [] : [EMPTY_EMPLOYEE, ...employees]}
            label="Filter by employee"
            loadingLabel="Loading employees"  
            parseItem={(item) => ({
              value: item.id,
              label: `${item.firstName} ${item.lastName}`,
            })}
            onChange={async (newValue) => {
              if (newValue === null) {
                return
              } else if (newValue.id === "") {
                await loadAllTransactions(); 
              } else {
                await loadTransactionsByEmployee(newValue.id)
              }
            }}
          />

          <div className="RampBreak--l" />

          <div className="RampGrid">
            <Transactions transactions={transactions} />

            {transactions !== null && (
              <button
                className="RampButton"
                disabled={paginatedTransactionsUtils.loading}
                style={{ display: (showViewMore ? 'block' : 'none')}}
                onClick={async () => {
                  await loadAllTransactions()
                }}
              >
                View More
              </button>
            )}
          </div>
        </main>
      </Fragment>
    )
  }
