/**
 * Sistema de iconos optimizado
 * Solo exporta los iconos que realmente se usan en la app
 * Esto reduce significativamente el tamaño del bundle
 */

// Importar solo los iconos necesarios de lucide-react-native
import {
  // Navegación
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  
  // Acciones
  Search,
  Settings,
  Edit,
  Plus,
  Check,
  Send,
  Share,
  Share2,
  
  // Social
  Heart,
  MessageCircle,
  MessageSquare,
  Users,
  UserPlus,
  User,
  
  // Contenido
  Bookmark,
  Eye,
  EyeOff,
  Camera,
  Image as ImageIcon,
  
  // Información
  Info,
  Bell,
  Clock,
  Calendar,
  MapPin,
  Globe,
  
  // Finanzas
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart2,
  
  // Educación
  BookOpen,
  Trophy,
  Award,
  Target,
  CheckCircle,
  
  // Comunicación
  Phone,
  Mail,
  
  // UI
  MoreHorizontal,
  Sliders,
  Home,
  Play,
  CreditCard,
  Tag,
} from 'lucide-react-native';

// Re-exportar todos los iconos
export {
  // Navegación
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  
  // Acciones
  Search,
  Settings,
  Edit,
  Plus,
  Check,
  Send,
  Share,
  Share2,
  
  // Social
  Heart,
  MessageCircle,
  MessageSquare,
  Users,
  UserPlus,
  User,
  
  // Contenido
  Bookmark,
  Eye,
  EyeOff,
  Camera,
  ImageIcon,
  
  // Información
  Info,
  Bell,
  Clock,
  Calendar,
  MapPin,
  Globe,
  
  // Finanzas
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart2,
  
  // Educación
  BookOpen,
  Trophy,
  Award,
  Target,
  CheckCircle,
  
  // Comunicación
  Phone,
  Mail,
  
  // UI
  MoreHorizontal,
  Sliders,
  Home,
  Play,
  CreditCard,
  Tag,
};

// Tipo para los props de los iconos
export type IconProps = {
  size?: number;
  color?: string;
  strokeWidth?: number;
};
