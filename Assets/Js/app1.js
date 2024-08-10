const cl = console.log;

const titleCon = document.getElementById("title");
const contentCon = document.getElementById("content");
const userIdCon = document.getElementById("userId");
const cardCon = document.getElementById("cardCon");
const submitBtn = document.getElementById("submitBtn");
const updateBtn = document.getElementById("updateBtn");
const postForm = document.getElementById("postForm");

const BASE_URL = "https://b14-post-default-rtdb.asia-southeast1.firebasedatabase.app/";
const POST_URL = `${BASE_URL}/posts.json`;

const loader = document.getElementById("loader");

const sweetalert =(icon,msg)=>{
    Swal.fire({
        title:msg,
        icon:icon,
        timer:2300
    })
}

const templating = (postArr) => {
  let res = ``;

  postArr.forEach((ele) => {
    res += `
        <div class="col-md-4 mb-4">
            <div class="card postCard h-100 mb-4" id="${ele.id}" >
                <div class="card-header">
                    <h3 class="m-0">${ele.title}</h3>

                </div>
                <div class="card-body">
                    <p class="m-0">${ele.body}</p>
                </div>
                <div class="card-footer d-flex justify-content-between text-dark ">
                    <button type="button" class="btn btn-warning" onclick="onEdit(this)">Edit</button>
                    <button type="button" class="btn btn-danger text-dark" onclick="onRemove(this)">Delete</button>
                </div>
            </div>
        </div>
        
        
        
        
        
        `
  });
  cardCon.innerHTML = res;
};

const makeApiCall = (methodName, apiUrl, msgBody = null) => {

    
  return new Promise((resolve, reject) => {
    loader.classList.remove("d-none");
    let xhr = new XMLHttpRequest();

    xhr.open(methodName, apiUrl);
    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) {
        
        resolve(JSON.parse(xhr.response));
      } else {
        reject(`Something went Wrong`);
      }
      loader.classList.add("d-none");
    };

    xhr.send(JSON.stringify(msgBody));
  });
};

const fetchCard= ()=>{
    makeApiCall("GET", POST_URL)
        .then(res=>{
            cl(res);
            let postArr =[];
            for (const key in res) {
                let obj = {...res[key],id:key}
                postArr.push(obj);
               
            }
            templating(postArr);
        })
        .catch(err=>{
            cl(err)
        })
        .finally(()=>{
            loader.classList.add("d-none")
        })
}
fetchCard();

const onPost = (eve)=>{
    eve.preventDefault();

    let newObj = {
        title:titleCon.value,
        body:contentCon.value,
        userId:userIdCon.value,
    }
    cl(newObj);

    makeApiCall("POST",POST_URL,newObj)
        .then(res=>{
            cl(res)
           newObj.id=res.name;
           let div = document.createElement('div');

           div.className=`col-md-4 mb-4`;
           div.innerHTML = `
                        <div class="card postCard h-100 mb-4" id="${newObj.id}" >
                <div class="card-header">
                    <h3 class="m-0">${newObj.title}</h3>

                </div>
                <div class="card-body">
                    <p class="m-0">${newObj.body}</p>
                </div>
                <div class="card-footer d-flex justify-content-between text-dark">
                    <button type="button" class="btn btn-warning" onclick="onEdit(this)">Edit</button>
                    <button type="button" class="btn btn-danger text-dark" onclick="onRemove(this)">Delete</button>
                </div>
            </div>
           
           
           `
           cardCon.prepend(div);
        })
        .catch(err=>{
            cl(err)
        })
        .finally(()=>{
            postForm.reset()
            loader.classList.add('d-none');
            sweetalert('success',"Post Addedd Successfully");
        })

}


const onEdit=(ele)=>{
    let editId = ele.closest('.card').id;
    cl(editId);

    localStorage.setItem("editId",editId);

    let EDIT_URL = `${BASE_URL}/posts/${editId}.json`;

    makeApiCall("GET",EDIT_URL)
            .then(res=>{
                cl(res);
                titleCon.value = res.title,
                contentCon.value = res.body,
                userIdCon.value = res.userId,
                titleCon.focus();
            })
            .catch(err=>{
                cl(err)
            })
            .finally(()=>{
                submitBtn.classList.add('d-none');
                updateBtn.classList.remove('d-none');
                loader.classList.add('d-none');
            })
}


const onUpdate = ()=>{
    let updateId =localStorage.getItem("editId");
    cl(updateId);

    let updatedObj = {
        title:titleCon.value,
        body:contentCon.value,
        userId:userIdCon.value
    }

    let UPDATE_URL = `${BASE_URL}/posts/${updateId}.json`;

    makeApiCall("PATCH",UPDATE_URL,updatedObj)
        .then(res=>{
            cl(res);

            let card = [...document.getElementById(updateId).children];
            card[0].innerHTML = `<h3 class="m-0">${updatedObj.title}</h3>`
            card[1].innerHTML = `<p class="m-0">${updatedObj.body}</p>`

        })
        .catch(err=>{
            cl(err)
        })
        .finally(()=>{
            postForm.reset()
            loader.classList.add('d-none')
            updateBtn.classList.add('d-none');
            submitBtn.classList.remove('d-none');
            sweetalert('success',"Post Updated Successfully")
        })
}

const onRemove =(ele)=>{
    let removeId  = ele.closest('.card').id;
    cl(removeId);

    let REMOVE_URL = `${BASE_URL}/posts/${removeId}.json`;
    
    Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
      }).then((result) => {
        if (result.isConfirmed) {
          makeApiCall("DELETE",REMOVE_URL)
                .then(res=>{
                    cl(res);
                    ele.closest('.card').parentElement.remove();
                })
                .catch(err=>{
                    cl(err)
                })
                .finally(()=>{
                    sweetalert('success',"Post Deleted Successfully");
                    postForm.reset()
                })
        }
      });
}

updateBtn.addEventListener("click",onUpdate)


postForm.addEventListener("submit",onPost)
