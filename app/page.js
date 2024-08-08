'use client'
import Image from "next/image";
import { useState, useEffect } from 'react'
import { Box, Stack, Typography, Button, Modal, TextField, Divider } from '@mui/material'
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import { firestore } from './firebase';
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'white',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
}

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('')
  const [searchQuery, setSearchQuery] = useState('');
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemDescription, setItemDescription] = useState('');
  const [itemPrice, setItemPrice] = useState(0);
  const [itemSupplier, setItemSupplier] = useState('');

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'))
    const docs = await getDocs(snapshot)
    const inventoryList = []
    docs.forEach((doc) => {
      inventoryList.push({ name: doc.id, ...doc.data() })
    })
    setInventory(inventoryList)
  }

  const addItem = async (item, quantity, description, price, supplier) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const { quantity: existingQuantity } = docSnap.data()
      await setDoc(docRef, { quantity: existingQuantity + quantity, description, price, supplier })
    } else {
      await setDoc(docRef, { quantity, description, price, supplier })
    }
    await updateInventory()
  }
  
  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      if (quantity <= 1) {
        await deleteDoc(docRef)
      } else {
        await setDoc(docRef, { quantity: quantity - 1 })
      }
    }
    await updateInventory()
  }
  
  useEffect(() => {
    updateInventory()
  }, [])

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredItems = inventory.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const exportToCSV = (inventory) => {
    const csv = Papa.unparse(inventory);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory.csv';
    a.click();
  };

  const exportToPDF = (inventory) => {
    const doc = new jsPDF();
    inventory.forEach((item, index) => {
      doc.text(`Item: ${item.name}`, 10, 10 + (index * 10));
      doc.text(`Quantity: ${item.quantity}`, 10, 20 + (index * 10));
      doc.text(`Description: ${item.description}`, 10, 30 + (index * 10));
      doc.text(`Price: ${item.price}`, 10, 40 + (index * 10));
      doc.text(`Supplier: ${item.supplier}`, 10, 50 + (index * 10));
    });
    doc.save('inventory.pdf');
  };
  
  return (
    <Box
      width="100vw"
      height="100vh"
      display={'flex'}
      justifyContent={'center'}
      flexDirection={'column'}
      alignItems={'center'}
      gap={2}
      overflow="auto"
      sx={{ bgcolor: '#d4f7d4', color: 'black' }}
    >
      <Typography variant="h2" sx={{ mt: 2, mb: 4, textAlign: 'center' }}>
        Pantry Management
      </Typography>
      <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Typography id="modal-modal-title" variant="h6" component="h2">
          Add Item
        </Typography>
        <Stack spacing={2}>
          <TextField
            id="outlined-basic"
            label="Item"
            variant="outlined"
            fullWidth
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
          />
          <TextField
            id="outlined-quantity"
            label="Quantity"
            type="number"
            variant="outlined"
            fullWidth
            value={itemQuantity}
            onChange={(e) => setItemQuantity(Number(e.target.value))}
          />
          <TextField
            id="outlined-description"
            label="Description"
            variant="outlined"
            fullWidth
            value={itemDescription}
            onChange={(e) => setItemDescription(e.target.value)}
          />
          <TextField
            id="outlined-price"
            label="Price"
            type="number"
            variant="outlined"
            fullWidth
            value={itemPrice}
            onChange={(e) => setItemPrice(Number(e.target.value))}
          />
          <TextField
            id="outlined-supplier"
            label="Supplier"
            variant="outlined"
            fullWidth
            value={itemSupplier}
            onChange={(e) => setItemSupplier(e.target.value)}
          />
          <Stack direction={'row'} spacing={2}>
          <Button
            variant="outlined"
            onClick={() => {
              addItem(itemName, itemQuantity, itemDescription, itemPrice, itemSupplier);
              setItemName('');
              setItemQuantity(1);
              setItemDescription('');
              setItemPrice(0);
              setItemSupplier('');
              handleClose()
            }}
            sx={{ bgcolor: '#28a745', color: 'black', '&:hover': { bgcolor: '#218838' } }}
          >
            Add
          </Button>
          <Button
          variant="outlined"
          onClick={handleClose}
          sx={{ color: 'black', borderColor: '#dc3545', '&:hover': { borderColor: '#c82333' } }}
        >
          Cancel
        </Button>
        </Stack>
      </Stack>
      </Box>
    </Modal>
    <Button 
    variant="contained" 
    onClick={handleOpen}
    sx={{ bgcolor: '#28a745', color: 'black', '&:hover': { bgcolor: '#218838' }, mb: 2 }}
    >
      Add New Item
    </Button>
    <TextField
        label="Search Items"
        variant="outlined"
        fullWidth
        value={searchQuery}
        onChange={handleSearch}
        sx={{ mb: 2, maxWidth: '800px', bgcolor: 'white' }}
    />
    <Box 
      border={'1px solid #333'} 
      sx={{ borderRadius: 2, overflow: 'hidden', bgcolor: '#ffcccb'  }}
    >
      <Box
        width="800px"
        height="100px"
        bgcolor={'#4169e1'}
        display={'flex'}
        justifyContent={'center'}
        alignItems={'center'}
      >
        <Typography variant={'h3'} color={'black'} textAlign={'center'}>
          Pantry Items
        </Typography>
      </Box>
      <Stack width="800px" height="300px" spacing={2} overflow={'auto'} p={2}>
        {filteredItems.map(({name, quantity, description, price, supplier}) => (
          <div key={name}>
          <Box
            key={name}
            width="100%"
            minHeight="150px"
            display={'flex'}
            flexDirection={'row'}
            justifyContent={'space-between'}
            alignItems={'center'}
            bgcolor={'#f8f9fa'}
            paddingX={5}
            borderRadius={1}
            boxShadow={1}
          >
            <Box display={'flex'} flexDirection={'column'} gap={2}>
            <Typography variant={'h3'} color="black">
              {name.charAt(0).toUpperCase() + name.slice(1)}
            </Typography>
            <Typography variant={'h5'} color="black">
              Quantity: {quantity}
            </Typography>
            <Typography variant={'h5'} color={'#333'}>
              Description: {description || 'N/A'}
            </Typography>
            <Typography variant={'h5'} color={'#333'}>
              Price: ${price != null ? price.toFixed(2) : 'N/A'}
            </Typography>
            <Typography variant={'h5'} color={'#333'}>
              Supplier: {supplier || 'N/A'}
            </Typography>
            </Box>
            <Button 
            variant="contained" 
            onClick={() => removeItem(name)}
            sx={{  marginLeft: 'auto', bgcolor: '#dc3545', '&:hover': { bgcolor: '#c82333' } }}
            >
              Remove
            </Button>
          </Box>
          <Divider sx={{ marginY: 2 }} /> {/* Add a divider between items */}
        </div>
        ))}
      </Stack>
    </Box>
    <Button onClick={() => exportToCSV(inventory)}>Export to CSV</Button>
    <Button onClick={() => exportToPDF(inventory)}>Export to PDF</Button>  
    </Box>
  );
}