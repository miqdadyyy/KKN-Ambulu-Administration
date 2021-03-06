<template>
  <v-main>
    <v-container>
      <v-card :loading="loading">
        <template slot="progress">
          <v-progress-linear color="green" indeterminate></v-progress-linear>
        </template>
        <v-card-title class="primary white--text">Buat Surat Baru</v-card-title>
        <ValidationObserver ref="observer">
          <v-container>
            <v-form ref="form" lazy-validation v-model="isFormValid">
              <ValidationProvider v-slot="{ errors }" name="select" rules="required">
                <v-select
                    v-model="categorySlug"
                    :disabled="loading"
                    :items="letterCategories"
                    :error-messages="errors"
                    label="Kategori"
                    item-text="name"
                    item-value="slug"
                    v-on:change="getLetterType"
                    data-vv-name="category"
                    required
                ></v-select>
                <v-select
                    v-model="letterTypeSlug"
                    v-if="categorySlug !== ''"
                    :items="letterTypes"
                    label="Tipe Surat"
                    item-text="name"
                    item-value="slug"
                    v-on:change="generateForm"
                    required
                >

                </v-select>
                <v-form-base :value="letterData" :schema="letterSchema"></v-form-base>
                <v-btn v-if="showSubmit" color="primary" @click="submitForm" :disabled="!isFormValid">Submit</v-btn>
              </ValidationProvider>
            </v-form>
          </v-container>
        </ValidationObserver>
      </v-card>
    </v-container>
  </v-main>
</template>

<script>
  import {required, max} from 'vee-validate/dist/rules';
  import {extend, ValidationObserver, ValidationProvider, setInteractionMode} from 'vee-validate';
  import AdminService from "../services/admin.service";
  import VFormBase from 'vuetify-form-base';

  setInteractionMode('eager');
  extend('required', {
    ...required,
    message: '{_field_} can not be empty',
  });
  extend('max', {
    ...max,
    message: '{_field_} may not be greater than {length} characters',
  });

  export default {
    components: {
      ValidationObserver,
      ValidationProvider,
      VFormBase
    },
    data() {
      return {
        letterTypeSlug: '',
        letterTypes: [],
        letterType: {},
        loading: false,
        letterCategories: [],
        categorySlug: '',
        category: {},
        letterData: {},
        letterSchema: {},
        showSubmit: false,
        isFormValid: false
      }
    },
    props: ["showSnackbar"],
    mounted() {
      this.loading = true;
      this.getLetterCategories();
    },
    methods: {
      validate() {
        return this.$refs.form.validate()
      },
      getLetterType(){
        this.category = this.letterCategories.find(cat => cat.slug === this.categorySlug);
        this.letterTypes = this.category.letters;
        this.letterSchema = {};
      },
      getLetterCategories() {
        AdminService.getLetterCategories()
          .then((result) => {
            console.log(result);
            if (result.statusCode === 200) {
              this.letterCategories = result.data;
            } else if (result.statusCode === 401) {
              this.$router.push('/logout');
            }

            this.loading = false;
          })
      },
      generateForm() {
        const required = msg => v => !!v || msg;
        const maxLen = l => v => (v && v.length <= l) || `max. ${l} Characters`;
        const type = this.letterTypes.find(type => type.slug === this.letterTypeSlug);
        this.letterType = type;
        const fields = {};
        type.fields.forEach(field => {
          let rules = [required(`${field.name} is required`)];
          if (field.length) {
            rules.push(maxLen(field.length));
          }
          fields[field.name] = {
            type: field.type,
            label: field.title,
            items: field.data,
            ext: field.type === 'date' ? 'text' : field.type,
            rules: rules,
            flex: 12
          }
        });
        this.letterSchema = fields;
        this.showSubmit = true;
      },
      submitForm() {
        if(this.validate()){
          this.letterData.category = this.categorySlug;
          this.letterData.letter_type = this.letterTypeSlug;
          AdminService.createLetter(this.letterData)
            .then((response) => {
              if (response.statusCode === 200) {
                this.$store.dispatch('successSnackbar', response.message)
                this.$router.push({ name: 'Letter' });
              } else {
                this.$store.dispatch('errorSnackbar', response.message)
              }
            })
            .catch((err) => {
              this.$store.dispatch('errorSnackbar', err.message);
            })
        }
      }
    },
  }
</script>
