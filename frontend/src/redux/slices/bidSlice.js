import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const fetchMyBids = createAsyncThunk(
  'bids/fetchMyBids',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/bids/my-bids');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchBidById = createAsyncThunk(
  'bids/fetchBidById',
  async (bidId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/bids/${bidId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateBid = createAsyncThunk(
  'bids/updateBid',
  async ({ bidId, bidData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/bids/${bidId}`, bidData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const withdrawBid = createAsyncThunk(
  'bids/withdrawBid',
  async (bidId, { rejectWithValue }) => {
    try {
      await api.put(`/bids/${bidId}/withdraw`);
      return bidId;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);



export const fetchProjectBids = createAsyncThunk(
  'bids/fetchProjectBids',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/bids/project/${projectId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);


const initialState = {
  bids: [],
  currentBid: null,
  projectBids: [],
  loading: false,
  error: null,
  filters: {
    status: 'all',
    sortBy: 'date',
  },
};

const bidSlice = createSlice({
  name: 'bids',
  initialState,
  reducers: {
    setBidFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearBidError: (state) => {
      state.error = null;
    },
    clearCurrentBid: (state) => {
      state.currentBid = null;
    },
    addBid: (state, action) => {
      state.bids.unshift(action.payload);
    },
    updateBidInList: (state, action) => {
      const index = state.bids.findIndex(b => b._id === action.payload._id);
      if (index !== -1) {
        state.bids[index] = action.payload;
      }
    },
    removeBid: (state, action) => {
      state.bids = state.bids.filter(b => b._id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch My Bids
      .addCase(fetchMyBids.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyBids.fulfilled, (state, action) => {
        state.loading = false;
        state.bids = action.payload;
      })
      .addCase(fetchMyBids.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch bids';
      })
      
      // Fetch Bid by ID
      .addCase(fetchBidById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBidById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBid = action.payload;
      })
      .addCase(fetchBidById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch bid';
      })
      
      // Update Bid
      .addCase(updateBid.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBid.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.bids.findIndex(b => b._id === action.payload._id);
        if (index !== -1) {
          state.bids[index] = action.payload;
        }
        if (state.currentBid && state.currentBid._id === action.payload._id) {
          state.currentBid = action.payload;
        }
      })
      .addCase(updateBid.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update bid';
      })
      
      // Withdraw Bid
      .addCase(withdrawBid.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(withdrawBid.fulfilled, (state, action) => {
        state.loading = false;
        state.bids = state.bids.filter(b => b._id !== action.payload);
        if (state.currentBid && state.currentBid._id === action.payload) {
          state.currentBid = null;
        }
      })
      .addCase(withdrawBid.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to withdraw bid';
      })
      
      // Fetch Project Bids
      .addCase(fetchProjectBids.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectBids.fulfilled, (state, action) => {
        state.loading = false;
        state.projectBids = action.payload;
      })
      .addCase(fetchProjectBids.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch project bids';
      });
  },
});

export const {
  setBidFilters,
  clearBidError,
  clearCurrentBid,
  addBid,
  updateBidInList,
  removeBid,
} = bidSlice.actions;

export default bidSlice.reducer;