async function changeProfilePhoto(event){const file=event.target.files?.[0];if(!file)return;if(!file.type.startsWith('image/'))return alert('Choisis une photo valide.');try{const resized=await resizeProfilePhoto(file);localStorage.setItem(profilePhotoKey(),resized);displayProfilePhoto()}catch{alert('La photo n’a pas pu être enregistrée.')}}
function removeProfilePhoto(){localStorage.removeItem(profilePhotoKey());displayProfilePhoto()}
const setupUserBeforeV4=setupUser;setupUser=function(data){setupUserBeforeV4(data);document.getElementById('feedNav')?.classList.remove('hide');displayProfilePhoto()};
const renderProfileBeforeV4=renderProfile;renderProfile=function(){renderProfileBeforeV4();displayProfilePhoto();if(typeof renderSocialExtras==='function')renderSocialExtras()};
if(user){document.getElementById('feedNav')?.classList.remove('hide');displayProfilePhoto()}
