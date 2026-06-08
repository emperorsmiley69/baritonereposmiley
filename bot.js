// Use the port provided by Railway/Render, or fallback to 5000 locally
const PORT = process.env.PORT || 5000; 

http.listen(PORT, () => { 
  console.log(`Control Tower website active on port ${PORT}`); 
});
