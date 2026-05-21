code = open(r'src\pages\Profile.jsx', encoding='utf-8').read()
prefix = code[:6456]
new_return = '''  return (
    <div style={{ maxWidth: 935, margin: "0 auto", padding: "0 0 40px", background: "#fafafa" }}>
      <div style={{ position: "relative", height: 220, background: profile.cover_url ? "url("+profile.cover_url+") center/cover" : "linear-gradient(135deg,#1a0a3e,#4a1a8e,#daa520)", overflow: "hidden" }}>
        {isOwn && (<><button onClick={() => coverRef.current?.click()} style={{ position:"absolute", bottom:10, right:10, background:"rgba(0,0,0,0.5)", border:"none", borderRadius:8, padding:"6px 12px", color:"#fff", cursor:"pointer", fontSize:12, fontWeight:600, display:"flex", alignItems:"center", gap:4 }}><Camera size={14}/> {t("profile.changeCover")}</button><input ref={coverRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleCoverChange}/></>)}
      </div>
      <div style={{ background:"#fff", borderBottom:"1px solid #dbdbdb", padding:"0 24px 20px" }}>
        <div style={{ display:"flex", alignItems:"flex-start", gap:32, flexWrap:"wrap" }}>
          <div style={{ position:"relative", marginTop:-44, flexShrink:0 }}>
            <div style={{ width:110, height:110, borderRadius:"50%", border:"4px solid #fff", overflow:"hidden", background:"linear-gradient(135deg,#daa520,#f0c040)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:36, fontWeight:700, color:"#fff", boxShadow:"0 2px 12px rgba(0,0,0,0.15)" }}>
              {profile.avatar_url ? <img src={profile.avatar_url} alt="" onClick={()=>setShowAvatarBig(true)} style={{width:"100%",height:"100%",objectFit:"cover",cursor:"pointer"}}/> : initials}
            </div>
            {showAvatarBig && (<div onClick={()=>setShowAvatarBig(false)} style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.85)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center"}}><img src={profile.avatar_url} alt="" style={{maxWidth:"90vw",maxHeight:"90vh",borderRadius:12}}/></div>)}
            {isOwn && (<><button onClick={()=>avatarRef.current?.click()} style={{position:"absolute",bottom:4,right:4,width:30,height:30,borderRadius:"50%",background:"#daa520",border:"3px solid #fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Camera size={13} color="#fff"/></button><input ref={avatarRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleAvatarChange}/></>)}
          </div>
          <div style={{ flex:1, paddingTop:16, minWidth:200 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap", marginBottom:12 }}>
              <h1 style={{ margin:0, fontSize:20, fontWeight:400, color:"#1a1a2e" }}>{profile.full_name || "Utilizador"}</h1>
              {profile.role==="pastor" && <span style={{background:"#daa520",color:"#fff",borderRadius:20,padding:"2px 10px",fontSize:11,fontWeight:700}}>Pastor</span>}
              {profile.role==="admin" && <span style={{background:"#e74c3c",color:"#fff",borderRadius:20,padding:"2px 10px",fontSize:11,fontWeight:700}}>Admin</span>}
            </div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:16 }}>
              {isOwn ? (<><button onClick={()=>setEditMode(true)} style={{padding:"7px 18px",borderRadius:8,border:"1px solid #dbdbdb",background:"#fff",cursor:"pointer",fontWeight:600,fontSize:13}}>{t("profile.editProfile")}</button></>) : (<><button onClick={()=>navigate("/mensagens")} style={{padding:"7px 18px",borderRadius:8,border:"none",background:"#0095f6",color:"#fff",cursor:"pointer",fontWeight:600,fontSize:13,display:"flex",alignItems:"center",gap:6}}><Send size={14}/> {t("profile.message")}</button><button style={{padding:"7px 18px",borderRadius:8,border:"1px solid #dbdbdb",background:"#fff",cursor:"pointer",fontWeight:600,fontSize:13}}><UserPlus size={14}/> {t("profile.follow")}</button></>)}
            </div>
            <div style={{ display:"flex", gap:32, marginBottom:12 }}>
              <div><span style={{fontWeight:600,fontSize:16,color:"#1a1a2e"}}>{totalPosts}</span> <span style={{fontSize:14,color:"#555"}}>{t("profile.posts")}</span></div>
              <div><span style={{fontWeight:600,fontSize:16,color:"#1a1a2e"}}>{profile.stats?.friends||0}</span> <span style={{fontSize:14,color:"#555"}}>{t("profile.friends")}</span></div>
              <div><span style={{fontWeight:600,fontSize:16,color:"#1a1a2e"}}>{profile.stats?.prayers||0}</span> <span style={{fontSize:14,color:"#555"}}>{t("profile.prayers")}</span></div>
            </div>
            {profile.bio && <p style={{margin:"0 0 4px",fontSize:14,color:"#1a1a2e",lineHeight:1.5}}>{profile.bio}</p>}
            {profile.church_name && <div style={{display:"flex",alignItems:"center",gap:4,fontSize:13,color:"#555",marginBottom:2}}><Church size={13}/> {profile.church_name}</div>}
            {profile.location && <div style={{display:"flex",alignItems:"center",gap:4,fontSize:13,color:"#555"}}><MapPin size={13}/> {profile.location}</div>}
          </div>
        </div>
      </div>
      <div style={{background:"#fff",borderBottom:"1px solid #dbdbdb",display:"flex",justifyContent:"center"}}>
        {[["posts",t("profile.posts")],["prayers",t("profile.prayers")],["friends",t("profile.friends")]].map(([tab,label])=>(
          <button key={tab} onClick={()=>setActiveTab(tab)} style={{padding:"14px 28px",border:"none",background:"none",cursor:"pointer",fontWeight:600,fontSize:12,color:activeTab===tab?"#1a1a2e":"#888",borderTop:activeTab===tab?"2px solid #1a1a2e":"2px solid transparent",letterSpacing:"0.08em",textTransform:"uppercase"}}>
            {label}
          </button>
        ))}
        {activeTab==="posts" && <div style={{display:"flex",marginLeft:"auto",borderLeft:"1px solid #dbdbdb"}}>
          <button onClick={()=>setViewMode("grid")} style={{padding:"14px",border:"none",background:"none",cursor:"pointer",color:viewMode==="grid"?"#1a1a2e":"#bbb"}}><Grid size={18}/></button>
          <button onClick={()=>setViewMode("list")} style={{padding:"14px",border:"none",background:"none",cursor:"pointer",color:viewMode==="list"?"#1a1a2e":"#bbb"}}><List size={18}/></button>
        </div>}
      </div>
      {activeTab==="posts" && (viewMode==="grid" ? (
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:3,marginTop:3}}>
          {posts.map(post=>(
            <div key={post.id} onClick={()=>setSelectedPost(post)} style={{aspectRatio:"1",background:"#f0f0f0",cursor:"pointer",overflow:"hidden",position:"relative"}}>
              {post.media_url&&post.media_url.match(/\\.(jpg|jpeg|png|gif|webp)/i)?<img src={post.media_url} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:post.media_url&&post.media_url.match(/\\.(mp4|webm|mov)/i)?<video src={post.media_url} style={{width:"100%",height:"100%",objectFit:"cover"}} muted/>:<div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,#1a0a3e,#4a1a8e)",padding:12}}><p style={{color:"#fff",fontSize:13,textAlign:"center",margin:0}}>{post.content}</p></div>}
              <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0)",transition:"background 0.2s",display:"flex",alignItems:"center",justifyContent:"center",gap:20,color:"#fff",fontWeight:700}} onMouseEnter={e=>e.currentTarget.style.background="rgba(0,0,0,0.45)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(0,0,0,0)"}>
                <span style={{display:"flex",alignItems:"center",gap:4}}><Heart size={18} fill="#fff"/> {post.like_count||0}</span>
                <span style={{display:"flex",alignItems:"center",gap:4}}><MessageCircle size={18} fill="#fff"/> {post.comment_count||0}</span>
              </div>
            </div>
          ))}
          {posts.length===0 && <div style={{gridColumn:"1/-1",textAlign:"center",padding:"4rem",color:"#888"}}><p>Sem publicacoes ainda</p></div>}
        </div>
      ):(
        <div style={{maxWidth:614,margin:"0 auto",padding:"16px 0"}}>
          {posts.map(post=>(
            <div key={post.id} style={{background:"#fff",border:"1px solid #dbdbdb",borderRadius:4,marginBottom:24,overflow:"hidden"}}>
              {post.media_url&&<img src={post.media_url} alt="" style={{width:"100%",maxHeight:400,objectFit:"cover"}}/>}
              <div style={{padding:"12px 16px"}}>
                <p style={{margin:"0 0 10px",fontSize:14,lineHeight:1.6}}>{post.content}</p>
              </div>
            </div>
          ))}
        </div>
      ))}
      {activeTab==="prayers" && <div style={{textAlign:"center",padding:"4rem",color:"#888"}}><Heart size={48} style={{marginBottom:16,opacity:0.2}}/><p>{t("profile.prayers")}</p></div>}
      {activeTab==="friends" && <div style={{textAlign:"center",padding:"4rem",color:"#888"}}><UserCheck size={48} style={{marginBottom:16,opacity:0.2}}/><p>{t("profile.friends")}</p></div>}
      {editMode && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
          <div style={{background:"#fff",borderRadius:16,width:"100%",maxWidth:480,padding:24}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <h2 style={{margin:0,fontSize:18,fontWeight:700}}>{t("profile.editProfile")}</h2>
              <button onClick={()=>setEditMode(false)} style={{background:"none",border:"none",cursor:"pointer"}}><X size={24}/></button>
            </div>
            {[["Nome","full_name"],[t("profile.bio","Bio"),"bio"],["Localizacao","location"],["Igreja","church_name"]].map(([label,key])=>(
              <div key={key} style={{marginBottom:16}}>
                <label style={{display:"block",fontWeight:600,fontSize:13,marginBottom:6,color:"#555"}}>{label}</label>
                {key==="bio"?<textarea value={editData[key]} onChange={e=>setEditData(prev=>({...prev,[key]:e.target.value}))} rows={3} style={{width:"100%",padding:"10px 12px",borderRadius:8,border:"1px solid #dbdbdb",fontSize:14,resize:"vertical",boxSizing:"border-box"}}/>:<input value={editData[key]} onChange={e=>setEditData(prev=>({...prev,[key]:e.target.value}))} style={{width:"100%",padding:"10px 12px",borderRadius:8,border:"1px solid #dbdbdb",fontSize:14,boxSizing:"border-box"}}/>}
              </div>
            ))}
            <div style={{display:"flex",gap:12,justifyContent:"flex-end"}}>
              <button onClick={()=>setEditMode(false)} style={{padding:"10px 20px",borderRadius:8,border:"1px solid #dbdbdb",background:"#fff",cursor:"pointer",fontWeight:600}}>{t("profile.cancel","Cancelar")}</button>
              <button onClick={saveProfile} style={{padding:"10px 20px",borderRadius:8,border:"none",background:"#0095f6",color:"#fff",cursor:"pointer",fontWeight:600}}>{t("profile.save")}</button>
            </div>
          </div>
        </div>
      )}
      {selectedPost && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={()=>setSelectedPost(null)}>
          <div style={{background:"#fff",borderRadius:4,maxWidth:900,width:"100%",maxHeight:"90vh",overflow:"auto",display:"flex"}} onClick={e=>e.stopPropagation()}>
            {selectedPost.media_url && <div style={{flex:1,background:"#000",display:"flex",alignItems:"center",justifyContent:"center"}}>{selectedPost.media_url.match(/\\.(mp4|webm|mov)/i)?<video src={selectedPost.media_url} controls style={{width:"100%",maxHeight:600}}/>:<img src={selectedPost.media_url} alt="" style={{width:"100%",maxHeight:600,objectFit:"contain"}}/>}</div>}
            <div style={{width:340,display:"flex",flexDirection:"column",flexShrink:0}}>
              <div style={{padding:"12px 16px",display:"flex",alignItems:"center",gap:10,borderBottom:"1px solid #eee"}}>
                <span style={{fontWeight:600,flex:1}}>{profile.full_name}</span>
                <button onClick={()=>setSelectedPost(null)} style={{background:"none",border:"none",cursor:"pointer"}}><X size={20}/></button>
              </div>
              <div style={{padding:16}}>
                <p style={{fontSize:14,lineHeight:1.6}}>{selectedPost.content}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      {cropModal&&cropImage&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.9)",zIndex:9999,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{position:"relative",width:"90vw",height:"55vh",maxWidth:480}}>
            <Cropper image={cropImage} crop={crop} zoom={zoom} aspect={cropType==="avatar"?1:16/5} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete}/>
          </div>
          <div style={{marginTop:16,display:"flex",gap:12}}>
            <button onClick={()=>{setCropModal(false);setCropImage(null);}} style={{padding:"10px 24px",borderRadius:20,background:"rgba(255,255,255,0.2)",border:"none",color:"white",cursor:"pointer"}}>{t("profile.cancel","Cancelar")}</button>
            <button onClick={handleCropSave} style={{padding:"10px 24px",borderRadius:20,background:"#0095f6",border:"none",color:"#fff",fontWeight:700,cursor:"pointer"}}>{t("profile.save")}</button>
          </div>
        </div>
      )}
    </div>
  );
}
'''
new_code = prefix + new_return
open(r'src\pages\Profile.jsx', 'w', encoding='utf-8').write(new_code)
print('Feito! Tamanho:', len(new_code))
