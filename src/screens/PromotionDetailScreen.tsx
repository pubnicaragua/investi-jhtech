import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  SafeAreaView,
  Linking,
  Share
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, Share2, MapPin, Clock, Tag, Calendar, User, Info, Phone, Mail, Globe } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { LanguageToggle } from '../components/LanguageToggle';

interface PromotionDetailRouteParams {
  promotion: {
    id: string;
    title: string;
    description: string;
    category: string;
    discount: string;
    imageUrl: string;
    validUntil: string;
    location: string;
    terms: string;
    contactInfo?: {
      name: string;
      phone: string;
      email: string;
      website: string;
    };
    requirements?: string[];
  };
}

interface PromotionDetailScreenProps {
  route?: {
    params?: {
      promotionId?: string;
    };
  };
}

export function PromotionDetailScreen({ route }: PromotionDetailScreenProps) {
  const { t } = useTranslation();
  const navigation = useNavigation();
  
  // Datos por defecto para testing
  const defaultPromotion = {
    id: '1',
    title: 'Descuento Especial en Software Nicaragua',
    description: 'Obtén un 25% de descuento en todos nuestros servicios de desarrollo de software. Válido hasta fin de mes. Incluye desarrollo web, móvil y consultoría tecnológica.',
    category: 'Tecnología',
    discount: '25% OFF',
    imageUrl: 'https://picsum.photos/400x200/2673f3/ffffff?text=Software+Nicaragua',
    validUntil: '31 de Diciembre 2024',
    location: 'Nicaragua',
    terms: 'Válido solo para nuevos clientes. No acumulable con otras promociones. Aplican términos y condiciones. El descuento se aplica sobre el precio base sin impuestos.',
    contactInfo: {
      name: 'Software Nicaragua',
      phone: '+505 8888-9999',
      email: 'info@softwarenicaragua.com',
      website: 'https://softwarenicaragua.com'
    },
    requirements: [
      'Ser nuevo cliente',
      'Presentar documento de identidad',
      'Válido hasta el 31 de diciembre 2024',
      'Mínimo de compra $500'
    ]
  };
  
  const routeParams = route?.params as { promotionId?: string } | undefined;
  const promotion = routeParams?.promotion || defaultPromotion;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this promotion: ${promotion.title} - ${promotion.description}`,
        title: promotion.title,
      });
    } catch (error) {
      console.error('Error sharing promotion:', error);
    }
  };

  const handleContact = (type: 'phone' | 'email' | 'website') => {
    if (!promotion.contactInfo) return;
    
    switch (type) {
      case 'phone':
        Linking.openURL(`tel:${promotion.contactInfo.phone}`);
        break;
      case 'email':
        Linking.openURL(`mailto:${promotion.contactInfo.email}`);
        break;
      case 'website':
        Linking.openURL(promotion.contactInfo.website);
        break;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('promotionDetail.title')}</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
            <Share2 size={20} color="#111" />
          </TouchableOpacity>
          <LanguageToggle />
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        <Image 
          source={{ uri: promotion.imageUrl || 'https://via.placeholder.com/400x200' }} 
          style={styles.promotionImage}
          resizeMode="cover"
        />

        <View style={styles.content}>
          <View style={styles.discountBadge}>
            <Tag size={16} color="white" />
            <Text style={styles.discountText}>{promotion.discount}</Text>
          </View>

          <Text style={styles.title}>{promotion.title}</Text>
          <Text style={styles.category}>{promotion.category}</Text>
          
          <Text style={styles.sectionTitle}>{t('promotionDetail.about')}</Text>
          <Text style={styles.description}>{promotion.description}</Text>

          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <MapPin size={18} color="#666" />
              <Text style={styles.detailText}>{promotion.location}</Text>
            </View>
            <View style={styles.detailItem}>
              <Clock size={18} color="#666" />
              <Text style={styles.detailText}>
                {t('promotionDetail.validUntil')} {promotion.validUntil}
              </Text>
            </View>
          </View>

          {promotion.contactInfo && (
            <View style={styles.contactSection}>
              <Text style={styles.sectionTitle}>{t('promotionDetail.contact')}</Text>
              <View style={styles.contactCard}>
                <View style={styles.contactHeader}>
                  <User size={20} color="#2673f3" />
                  <Text style={styles.contactName}>{promotion.contactInfo.name}</Text>
                </View>
                
                <TouchableOpacity 
                  style={styles.contactItem}
                  onPress={() => handleContact('phone')}
                >
                  <Phone size={18} color="#666" />
                  <Text style={styles.contactText}>{promotion.contactInfo.phone}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.contactItem}
                  onPress={() => handleContact('email')}
                >
                  <Mail size={18} color="#666" />
                  <Text style={styles.contactText}>{promotion.contactInfo.email}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.contactItem}
                  onPress={() => handleContact('website')}
                >
                  <Globe size={18} color="#666" />
                  <Text style={[styles.contactText, styles.websiteText]}>
                    {promotion.contactInfo.website.replace(/^https?:\/\//, '')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.termsSection}>
            <View style={styles.termsHeader}>
              <Info size={20} color="#666" />
              <Text style={styles.sectionTitle}>{t('promotionDetail.terms')}</Text>
            </View>
            <Text style={styles.termsText}>{promotion.terms}</Text>
            
            {promotion.requirements && promotion.requirements.length > 0 && (
              <View style={styles.requirementsList}>
                {promotion.requirements.map((req, index) => (
                  <View key={index} style={styles.requirementItem}>
                    <View style={styles.bulletPoint} />
                    <Text style={styles.requirementText}>{req}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => {
            // Handle apply promotion
          }}
        >
          <Text style={styles.primaryButtonText}>{t('promotionDetail.applyPromotion')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
    marginLeft: 16,
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shareButton: {
    padding: 8,
    marginRight: 8,
  },
  scrollView: {
    flex: 1,
  },
  promotionImage: {
    width: '100%',
    height: 220,
  },
  content: {
    padding: 20,
  },
  discountBadge: {
    position: 'absolute',
    top: -30,
    left: 20,
    backgroundColor: '#2673f3',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    zIndex: 1,
  },
  discountText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 4,
    fontSize: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111',
    marginTop: 16,
    marginBottom: 4,
  },
  category: {
    fontSize: 16,
    color: '#2673f3',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
    marginTop: 24,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
  },
  detailsContainer: {
    marginTop: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  contactSection: {
    marginTop: 8,
  },
  contactCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    marginLeft: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  contactText: {
    fontSize: 14,
    color: '#444',
    marginLeft: 12,
  },
  websiteText: {
    color: '#2673f3',
  },
  termsSection: {
    marginTop: 8,
  },
  termsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  termsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  requirementsList: {
    marginTop: 12,
  },
  requirementItem: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#666',
    marginTop: 8,
    marginRight: 12,
  },
  requirementText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    backgroundColor: '#fff',
  },
  primaryButton: {
    backgroundColor: '#2673f3',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PromotionDetailScreen;
