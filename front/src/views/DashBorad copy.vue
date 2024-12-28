<template>
  <div class="q-pa-xs">
    <!-- <q-form @submit.prevent="onSubmit">
      <q-file v-model="file" name="test" label="Standard" />
      <q-btn label="Submit" type="submit" color="primary"/>
    </q-form> -->
    <p>Dashboard</p>
  </div>
</template>

<script>
// import { onMounted } from 'vue';
// import { ref } from 'vue';
// import { post, get } from '../utils/api';
export default {
  setup() {
    // const file = ref(null);
    // const onSubmit = async (evt) => {
    //   const formData = new FormData(evt.target)
    //     const data = []

    //     for (const [ name, value ] of formData.entries()) {
    //       if (value.name.length > 0) {
    //         data.push({
    //           name,
    //           value: value.name
    //         })
    //       }
    //     }

    //     console.log(data);

      // console.log(e.target);
      // const formData = new FormData();
      // formData.append('test', file.value);
      // try {
      //   // const d = await post('/logout');
      //   // const d = await post('/login', {
      //   //     "account": "cosmo_dai",
      //   //     "password": "abcd"
      //   // });
      //   const d = await post('/media/upload', formData);
      //   console.log(d);
      // } catch (err) {
      //   console.log(err);
      // }
    // }

    // onMounted(async () => {
    //   try {
    //     // let a = await get('products');
    //     // let a = await post('login', {
    //     //     "account": "cosmo_dai",
    //     //     "password": "abcd"
    //     // });

    //     console.log(a);
    //   } catch (err) {
    //     console.log(err);
    //   }
    // })
  }
}
</script>