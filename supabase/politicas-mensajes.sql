-- Políticas RLS para la tabla mensajes (libro de visitas)
-- Ejecuta este archivo en Supabase: SQL Editor → New query → pegar y Run

-- 1. Activar RLS en la tabla (si no está activo)
ALTER TABLE mensajes ENABLE ROW LEVEL SECURITY;

-- 2. Política de lectura: cualquiera puede ver todos los mensajes
DROP POLICY IF EXISTS "Permitir lectura de mensajes" ON mensajes;
CREATE POLICY "Permitir lectura de mensajes"
  ON mensajes FOR SELECT
  TO public
  USING (true);

-- 3. Política de inserción: cualquiera puede crear mensajes
DROP POLICY IF EXISTS "Permitir crear mensajes" ON mensajes;
CREATE POLICY "Permitir crear mensajes"
  ON mensajes FOR INSERT
  TO public
  WITH CHECK (true);

-- 4. Política de edición: cualquiera puede actualizar cualquier mensaje
DROP POLICY IF EXISTS "Permitir editar mensajes" ON mensajes;
CREATE POLICY "Permitir editar mensajes"
  ON mensajes FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- 5. Política de eliminación: cualquiera puede eliminar cualquier mensaje
DROP POLICY IF EXISTS "Permitir eliminar mensajes" ON mensajes;
CREATE POLICY "Permitir eliminar mensajes"
  ON mensajes FOR DELETE
  TO public
  USING (true);
