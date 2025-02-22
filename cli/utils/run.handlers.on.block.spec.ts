import { provideRunHandlersOnBlock, RunHandlersOnBlock } from "./run.handlers.on.block"

describe("runHandlersOnBlock", () => {
  let runHandlersOnBlock: RunHandlersOnBlock
  const mockGetAgentHandlers = jest.fn()
  const mockGetNetworkId = jest.fn()
  const mockGetBlockWithTransactions = jest.fn()
  const mockGetTraceData = jest.fn().mockReturnValue([])
  const mockGetLogsForBlock = jest.fn().mockReturnValue([])
  const mockCreateBlockEvent = jest.fn()
  const mockCreateTransactionEvent = jest.fn()
  const mockBlockHash = '0xabc'
  const mockTxHash = "0x123"

  beforeAll(() => {
    runHandlersOnBlock = provideRunHandlersOnBlock(
      mockGetAgentHandlers, mockGetNetworkId, mockGetBlockWithTransactions, mockGetTraceData, 
      mockGetLogsForBlock, mockCreateBlockEvent, mockCreateTransactionEvent
    )
  })

  it("throws an error if no handlers found", async () => {
    mockGetAgentHandlers.mockReturnValueOnce({ })

    try {
      await runHandlersOnBlock(mockBlockHash)
    } catch (e) {
      expect(e.message).toEqual('no block/transaction handler found')
    }

    expect(mockGetAgentHandlers).toHaveBeenCalledTimes(1)
  })

  it("invokes block handlers with block event and transaction handlers with transaction event for each transaction in block", async () => {
    mockGetAgentHandlers.mockReset()
    const mockHandleBlock = jest.fn().mockReturnValue([])
    const mockHandleTransaction = jest.fn().mockReturnValue([])
    mockGetAgentHandlers.mockReturnValueOnce({ handleBlock: mockHandleBlock, handleTransaction: mockHandleTransaction })
    const mockNetworkId = 1
    mockGetNetworkId.mockReturnValueOnce(mockNetworkId)
    const mockTransaction = { hash: mockTxHash }
    const mockBlock = { hash: mockBlockHash, number: 7, transactions: [mockTransaction] }
    mockGetBlockWithTransactions.mockReturnValueOnce(mockBlock)
    const mockBlockEvent = {}
    mockCreateBlockEvent.mockReturnValueOnce(mockBlockEvent)
    const mockTrace = { transactionHash: mockTxHash, some: 'trace' }
    mockGetTraceData.mockReturnValueOnce([mockTrace])
    const mockLog = { transactionHash: mockTxHash, some: 'log' }
    mockGetLogsForBlock.mockReturnValueOnce([mockLog])
    const mockTxEvent = {}
    mockCreateTransactionEvent.mockReturnValueOnce(mockTxEvent)

    await runHandlersOnBlock(mockBlockHash)

    expect(mockGetAgentHandlers).toHaveBeenCalledTimes(1)
    expect(mockGetAgentHandlers).toHaveBeenCalledWith()
    expect(mockGetNetworkId).toHaveBeenCalledTimes(1)
    expect(mockGetNetworkId).toHaveBeenCalledWith()
    expect(mockGetBlockWithTransactions).toHaveBeenCalledTimes(1)
    expect(mockGetBlockWithTransactions).toHaveBeenCalledWith(mockBlockHash)
    expect(mockCreateBlockEvent).toHaveBeenCalledTimes(1)
    expect(mockCreateBlockEvent).toHaveBeenCalledWith(mockBlock, mockNetworkId)
    expect(mockHandleBlock).toHaveBeenCalledTimes(1)
    expect(mockHandleBlock).toHaveBeenCalledWith(mockBlockEvent)
    expect(mockGetLogsForBlock).toHaveBeenCalledTimes(1)
    expect(mockGetLogsForBlock).toHaveBeenCalledWith(mockBlock.number)
    expect(mockGetTraceData).toHaveBeenCalledTimes(1)
    expect(mockGetTraceData).toHaveBeenCalledWith(mockBlock.number)
    expect(mockCreateTransactionEvent).toHaveBeenCalledTimes(1)
    expect(mockCreateTransactionEvent).toHaveBeenCalledWith(mockTransaction, mockBlock, mockNetworkId, [mockTrace], [mockLog])
    expect(mockHandleTransaction).toHaveBeenCalledTimes(1)
    expect(mockHandleTransaction).toHaveBeenCalledWith(mockTxEvent)
  })
})