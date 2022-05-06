import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { switchMap, tap } from 'rxjs';
import { PaisSmall } from '../../interfaces/paises.interface';
import { PaisesService } from '../../services/paises.service';

@Component({
  selector: 'app-selector',
  templateUrl: './selector.component.html',
  styles: [
  ]
})
export class SelectorComponent implements OnInit {

  constructor( private fb: FormBuilder,
      private paisesService: PaisesService ) { }

  miFormulario: FormGroup = this.fb.group({
    region: ['', Validators.required],
    pais: ['', Validators.required],
    frontera: ['', Validators.required],
  }); 

  regiones: string[] = [];
  paises: PaisSmall[] = [];
  // fronteras: string[] = [];
  codigosFronteras: string[] = [];
  fronteras: PaisSmall[] = [];
  cargando: boolean = false;

  ngOnInit(): void {
    this.regiones = this.paisesService.regiones;

    this.miFormulario.get('region')?.valueChanges
    .pipe(
      tap(() =>{ 
        this.miFormulario.get('pais')?.reset('');
        this.cargando = true; 
      }),
      switchMap( region => this.paisesService.getCountriesByRegion(region) )
    )
    .subscribe( paises => {
      this.paises = paises;
      this.cargando = false; 
    });

    this.miFormulario.get('pais')?.valueChanges
    .pipe(
      tap( () =>{ 
        this.fronteras = []; 
        this.miFormulario.get('frontera')?.reset('');
        this.cargando = true; 
      } ),
      switchMap( code => this.paisesService.getCountryByCode( code ) ),
      tap(
        pais => {
        pais?.map( fronteras => this.codigosFronteras = fronteras.borders || [] )
      }),
      switchMap( pais => this.paisesService.getCountriesByBordersCode( this.codigosFronteras ) )
    )
    .subscribe( paises => {
      // pais?.map( fronteras => this.fronteras = fronteras.borders || [] );
      this.fronteras = paises;
      this.cargando = false; 
    });  

  }

  guardar(){
    console.log(this.miFormulario.value);
  }
}
